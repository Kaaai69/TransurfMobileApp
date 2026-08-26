import {
  ensureCoreUserTask,
  ensureMicroUserTask,
  addXp,
  getActiveCoreTask,
  getUserStateRow,
  hasTaskLog,
  insertTaskLog,
  listGraduatedSupportTasks,
  listRecentLogs,
  microUserTaskId,
  writeStateValues,
  type ActiveTaskRow,
  type BudgetMinutes,
} from '../db/repo';
import type { DatabaseConnection } from '../db/migrate';
import { recalculateState, type DriftEvent, type StateValues } from '../domain/drift';
import { addDays, diffInDays, today as todayISO, type DateString } from '../domain/dates';
import { xpAwards } from '../domain/tiers';
import { findMicroTemplateById, selectMicroTaskForDay } from '../content/microTasks';
import type { KeyValueStorage } from '../launch/state';
import { resolveGraceDaysLeft, type ChainState } from './chain';

export const habitDayTotal = 60;

export type DailySnapshot = Readonly<{
  today: DateString;
  dayNumber: number;
  state: StateValues;
  baseline: StateValues;
  levelXp: number;
  graceDaysLeft: number;
  core: Readonly<{
    task: ActiveTaskRow;
    doneToday: boolean;
    doneCount: number;
    progress: number;
  }>;
  support: readonly Readonly<{ task: ActiveTaskRow; doneToday: boolean }>[];
  micro: Readonly<{
    templateId: string;
    actionText: string;
    category: string;
    doneToday: boolean;
  }> | null;
}>;

function toStateValues(row: {
  sleep: number;
  energy: number;
  movement: number;
  food: number;
  water: number;
  mind: number;
}): StateValues {
  return {
    sleep: row.sleep,
    energy: row.energy,
    movement: row.movement,
    food: row.food,
    water: row.water,
    mind: row.mind,
  };
}

async function buildEvents(
  database: DatabaseConnection,
  core: ActiveTaskRow | null,
  sinceDate: DateString,
): Promise<readonly DriftEvent[]> {
  const logs = await listRecentLogs(database, sinceDate);
  const events: DriftEvent[] = logs
    .filter((entry) => entry.status !== 'no_entry')
    .map((entry) => ({
      date: entry.date,
      category: entry.category,
      slot: entry.slot === 'custom' ? 'micro' : entry.slot,
      status: entry.status,
    }));

  if (core !== null && logs.some((entry) => entry.slot === 'core')) {
    const loggedDates = new Set(
      logs.filter((entry) => entry.slot === 'core').map((entry) => entry.date),
    );
    const yesterday = addDays(todayISO(), -1);

    for (
      let date = addDays(core.startedAt, 1);
      diffInDays(date, yesterday) >= 0;
      date = addDays(date, 1)
    ) {
      if (!loggedDates.has(date)) {
        events.push({ date, category: core.category, slot: 'core', status: 'no_entry' });
      }
    }
  }

  return events;
}

export async function persistRecalculatedState(
  database: DatabaseConnection,
): Promise<StateValues | null> {
  const row = await getUserStateRow(database);
  const core = await getActiveCoreTask(database);

  if (row === null || core === null) return null;

  const state = recalculateState({
    baseline: toStateValues({
      sleep: row.baselineSleep,
      energy: row.baselineEnergy,
      movement: row.baselineMovement,
      food: row.baselineFood,
      water: row.baselineWater,
      mind: row.baselineMind,
    }),
    events: await buildEvents(database, core, core.startedAt),
    asOf: todayISO(),
  });

  await writeStateValues(database, state, todayISO());

  return state;
}

export async function loadDailySnapshot(
  database: DatabaseConnection,
  chain: ChainState,
): Promise<DailySnapshot | null> {
  const row = await getUserStateRow(database);
  const core = await getActiveCoreTask(database);

  if (row === null || core === null) return null;

  const today = todayISO();
  const state = await persistRecalculatedState(database);
  const coreDoneToday = await hasTaskLog(database, core.id, today);
  const supportRows = await listGraduatedSupportTasks(database);
  const support = await Promise.all(
    supportRows.map(async (task) => ({
      task,
      doneToday: (await hasTaskLog(database, task.id, today)) === 'done',
    })),
  );

  const dayNumber = Math.max(1, diffInDays(core.startedAt, today) + 1);
  const microTemplate = selectMicroTaskForDay(core.category, dayNumber - 1);
  const microDoneToday =
    (await hasTaskLog(database, microUserTaskId(microTemplate.id, today), today)) === 'done';

  const logs = await listRecentLogs(database, core.startedAt);
  const doneCount = logs.filter((entry) => entry.slot === 'core' && entry.status === 'done').length;

  return {
    today,
    dayNumber,
    state: state ?? toStateValues(row),
    baseline: toStateValues({
      sleep: row.baselineSleep,
      energy: row.baselineEnergy,
      movement: row.baselineMovement,
      food: row.baselineFood,
      water: row.baselineWater,
      mind: row.baselineMind,
    }),
    levelXp: row.levelXp,
    graceDaysLeft: resolveGraceDaysLeft(chain, today),
    core: {
      task: core,
      doneToday: coreDoneToday === 'done',
      doneCount,
      progress: Math.min(1, dayNumber / habitDayTotal),
    },
    support,
    micro: {
      templateId: microTemplate.id,
      actionText: microTemplate.actionText,
      category: microTemplate.category,
      doneToday: microDoneToday,
    },
  };
}

const perfectWeekStorageKey = 'daily.perfectWeekAwarded';

export async function markCoreDone(
  database: DatabaseConnection,
  storage: KeyValueStorage,
): Promise<boolean> {
  const core = await getActiveCoreTask(database);
  const today = todayISO();

  if (core === null) return false;

  const inserted = await insertTaskLog(database, core.id, today, 'done', xpAwards.core_completed);

  if (!inserted) return false;

  await addXp(database, xpAwards.core_completed);

  const weekStart = addDays(today, -6);
  const alreadyAwarded = await storage.getItem(perfectWeekStorageKey);
  const logs = await listRecentLogs(database, weekStart);
  const coreWeekLogs = logs.filter((entry) => entry.slot === 'core');
  const allSevenDone = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)).every(
    (date) => coreWeekLogs.some((entry) => entry.date === date && entry.status === 'done'),
  );

  if (allSevenDone && alreadyAwarded !== weekStart) {
    await addXp(database, xpAwards.perfect_week);
    await storage.setItem(perfectWeekStorageKey, weekStart);
  }

  await persistRecalculatedState(database);

  return true;
}

export async function markMicroDone(
  database: DatabaseConnection,
  templateId: string,
): Promise<boolean> {
  const template = findMicroTemplateById(templateId);
  const today = todayISO();

  if (template === null) return false;

  const userTaskId = await ensureMicroUserTask(database, templateId, today);
  const inserted = await insertTaskLog(
    database,
    userTaskId,
    today,
    'done',
    xpAwards.micro_completed,
  );

  if (!inserted) return false;

  await addXp(database, xpAwards.micro_completed);
  await persistRecalculatedState(database);

  return true;
}

export async function markSupportDone(
  database: DatabaseConnection,
  taskId: string,
): Promise<boolean> {
  const today = todayISO();
  const inserted = await insertTaskLog(database, taskId, today, 'done', xpAwards.support_completed);

  if (!inserted) return false;

  await addXp(database, xpAwards.support_completed);

  return true;
}

export async function ensureProfileTask(
  database: DatabaseConnection,
  templateId: string,
  startedAt: DateString,
): Promise<void> {
  await ensureCoreUserTask(database, templateId, startedAt);
}

/** Дни с момента старта задачи без отметки «сделал» — до вчерашнего включительно. */
export async function listCoreMissedDates(
  database: DatabaseConnection,
): Promise<readonly DateString[]> {
  const core = await getActiveCoreTask(database);

  if (core === null) return [];

  const today = todayISO();
  const logs = await listRecentLogs(database, core.startedAt);
  const logged = new Set(logs.filter((entry) => entry.slot === 'core').map((entry) => entry.date));
  const missed: DateString[] = [];

  for (
    let date = addDays(core.startedAt, 1);
    diffInDays(date, addDays(today, -1)) >= 0;
    date = addDays(date, 1)
  ) {
    if (!logged.has(date)) missed.push(date);
  }

  return missed;
}

export type { BudgetMinutes };
