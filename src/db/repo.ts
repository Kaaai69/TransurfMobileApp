import type { CategoryScores } from '../domain/scoring';
import type { StateValues } from '../domain/drift';
import type { Category, TaskLogStatus, UserTaskSlot } from './schema';
import type { DatabaseConnection } from './migrate';
import type { DateString } from '../domain/dates';

export const localUserId = 'local';

export type BudgetMinutes = 5 | 15 | 30 | 'more';

const budgetColumnValues: Record<BudgetMinutes, number> = {
  5: 5,
  15: 15,
  30: 30,
  more: 45,
};

export type TemplateRow = Readonly<{
  id: string;
  category: Category;
  slot: 'core' | 'micro';
  tier: number | null;
  anchorText: string;
  actionText: string;
  subtitle: string;
  sourceDoi: string | null;
  sourceCitation: string | null;
  sourceNote: string | null;
}>;

export type ActiveTaskRow = Readonly<{
  id: string;
  templateId: string;
  slot: UserTaskSlot;
  startedAt: DateString;
  category: Category;
  anchorText: string;
  actionText: string;
  subtitle: string;
  sourceDoi: string | null;
  sourceCitation: string | null;
  sourceNote: string | null;
  tier: number | null;
}>;

export type UserStateRow = Readonly<{
  sleep: number;
  energy: number;
  movement: number;
  food: number;
  water: number;
  mind: number;
  baselineSleep: number;
  baselineEnergy: number;
  baselineMovement: number;
  baselineFood: number;
  baselineWater: number;
  baselineMind: number;
  recalculatedAt: DateString;
  levelXp: number;
  graceDaysLeft: number;
}>;

export type LogEntryRow = Readonly<{
  date: DateString;
  status: TaskLogStatus;
  slot: UserTaskSlot;
  category: Category;
}>;

export async function saveUserProfile(
  database: DatabaseConnection,
  input: Readonly<{
    baseline: StateValues;
    scores: CategoryScores;
    budgetMinutes: BudgetMinutes;
    today: DateString;
  }>,
): Promise<void> {
  await database.runAsync(
    `INSERT OR REPLACE INTO user_state (
      user_id, sleep, energy, movement, food, water, mind,
      baseline_sleep, baseline_energy, baseline_movement, baseline_food, baseline_water, baseline_mind,
      recalculated_at, level_xp, grace_days_left, grace_window_start
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 2, ?)`,
    localUserId,
    input.scores.sleep,
    input.scores.energy,
    input.scores.movement,
    input.scores.food,
    input.scores.water,
    input.scores.mind,
    input.baseline.sleep,
    input.baseline.energy,
    input.baseline.movement,
    input.baseline.food,
    input.baseline.water,
    input.baseline.mind,
    input.today,
    input.today,
  );

  await database.runAsync(
    `INSERT OR REPLACE INTO user_flags (user_id, food_soft_mode, budget_minutes, stopfactor_type, stopfactor_value)
     VALUES (?, 0, ?, NULL, NULL)`,
    localUserId,
    budgetColumnValues[input.budgetMinutes],
  );
}

export async function getUserStateRow(
  database: DatabaseConnection,
): Promise<UserStateRow | null> {
  return database.getFirstAsync<UserStateRow>(
    `SELECT sleep, energy, movement, food, water, mind,
            baseline_sleep AS baselineSleep, baseline_energy AS baselineEnergy,
            baseline_movement AS baselineMovement, baseline_food AS baselineFood,
            baseline_water AS baselineWater, baseline_mind AS baselineMind,
            substr(recalculated_at, 1, 10) AS recalculatedAt, level_xp AS levelXp,
            grace_days_left AS graceDaysLeft
     FROM user_state WHERE user_id = ? LIMIT 1`,
    localUserId,
  );
}

export async function writeStateValues(
  database: DatabaseConnection,
  state: StateValues,
  today: DateString,
): Promise<void> {
  await database.runAsync(
    `UPDATE user_state SET sleep = ?, energy = ?, movement = ?, food = ?, water = ?, mind = ?,
       recalculated_at = ? WHERE user_id = ?`,
    Math.round(state.sleep),
    Math.round(state.energy),
    Math.round(state.movement),
    Math.round(state.food),
    Math.round(state.water),
    Math.round(state.mind),
    today,
    localUserId,
  );
}

export async function addXp(database: DatabaseConnection, amount: number): Promise<void> {
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new RangeError('XP awards must be positive safe integers');
  }

  await database.runAsync(
    'UPDATE user_state SET level_xp = level_xp + ? WHERE user_id = ?',
    amount,
    localUserId,
  );
}

export function coreUserTaskId(templateId: string): string {
  return `core:${templateId}`;
}

export async function ensureCoreUserTask(
  database: DatabaseConnection,
  templateId: string,
  startedAt: DateString,
): Promise<void> {
  const template = await getTemplateById(database, templateId);

  if (template === null || template.slot !== 'core') {
    throw new Error(`Core template ${templateId} is not seeded`);
  }

  await database.runAsync(
    `INSERT OR IGNORE INTO user_task (id, user_id, template_id, slot, custom_anchor, custom_action, category, started_at, status)
     VALUES (?, ?, ?, 'core', NULL, NULL, ?, ?, 'active')`,
    coreUserTaskId(templateId),
    localUserId,
    templateId,
    template.category,
    startedAt,
  );
}

export async function ensureGraduatedSupportTask(
  database: DatabaseConnection,
  templateId: string,
  startedAt: DateString,
): Promise<void> {
  const template = await getTemplateById(database, templateId);

  if (template === null || template.slot !== 'core') {
    throw new Error(`Core template ${templateId} is not seeded`);
  }

  await database.runAsync(
    `INSERT OR IGNORE INTO user_task (id, user_id, template_id, slot, custom_anchor, custom_action, category, started_at, status)
     VALUES (?, ?, ?, 'support', NULL, NULL, ?, ?, 'graduated')`,
    `support:${templateId}`,
    localUserId,
    templateId,
    template.category,
    startedAt,
  );
}

export function microUserTaskId(templateId: string, date: DateString): string {
  return `micro:${templateId}:${date}`;
}

export async function ensureMicroUserTask(
  database: DatabaseConnection,
  templateId: string,
  date: DateString,
): Promise<string> {
  const template = await getTemplateById(database, templateId);

  if (template === null || template.slot !== 'micro') {
    throw new Error(`Micro template ${templateId} is not seeded`);
  }

  const id = microUserTaskId(templateId, date);

  await database.runAsync(
    `INSERT OR IGNORE INTO user_task (id, user_id, template_id, slot, custom_anchor, custom_action, category, started_at, status)
     VALUES (?, ?, ?, 'micro', NULL, NULL, ?, ?, 'active')`,
    id,
    localUserId,
    templateId,
    template.category,
    date,
  );

  return id;
}

export async function getTemplateById(
  database: DatabaseConnection,
  templateId: string,
): Promise<TemplateRow | null> {
  return database.getFirstAsync<TemplateRow>(
    `SELECT id, category, slot, tier, anchor_text AS anchorText, action_text AS actionText,
            subtitle, source_doi AS sourceDoi, source_citation AS sourceCitation,
            source_note AS sourceNote
     FROM task_template WHERE id = ? LIMIT 1`,
    templateId,
  );
}

const activeTaskSelect = `
  SELECT ut.id AS id, ut.template_id AS templateId, ut.slot AS slot,
         ut.started_at AS startedAt,
         tt.category AS category, tt.anchor_text AS anchorText, tt.action_text AS actionText,
         tt.subtitle AS subtitle, tt.source_doi AS sourceDoi, tt.source_citation AS sourceCitation,
         tt.source_note AS sourceNote
  FROM user_task ut JOIN task_template tt ON tt.id = ut.template_id
`;

export async function getActiveCoreTask(
  database: DatabaseConnection,
): Promise<ActiveTaskRow | null> {
  return database.getFirstAsync<ActiveTaskRow>(
    `${activeTaskSelect} WHERE ut.user_id = ? AND ut.slot = 'core' AND ut.status = 'active' LIMIT 1`,
    localUserId,
  );
}

export async function listGraduatedSupportTasks(
  database: DatabaseConnection,
): Promise<readonly ActiveTaskRow[]> {
  const rows = await database.getAllAsync<ActiveTaskRow>(
    `${activeTaskSelect} WHERE ut.user_id = ? AND ut.slot = 'support' AND ut.status = 'graduated'
     ORDER BY ut.started_at ASC LIMIT 5`,
    localUserId,
  );

  return rows ?? [];
}

export async function replaceActiveCoreTask(
  database: DatabaseConnection,
  currentTemplateId: string,
  nextTemplateId: string,
  startedAt: DateString,
): Promise<void> {
  await database.execAsync('BEGIN IMMEDIATE;');

  try {
    await database.runAsync(
      `UPDATE user_task SET status = 'graduated' WHERE id = ? AND user_id = ?`,
      coreUserTaskId(currentTemplateId),
      localUserId,
    );
    await ensureGraduatedSupportTask(database, currentTemplateId, startedAt);
    await ensureCoreUserTask(database, nextTemplateId, startedAt);
    await addXp(database, 100);

    await database.execAsync('COMMIT;');
  } catch (error) {
    await database.execAsync('ROLLBACK;');
    throw error;
  }
}

export async function setGraceDaysLeft(
  database: DatabaseConnection,
  graceDaysLeft: number,
): Promise<void> {
  if (!Number.isSafeInteger(graceDaysLeft) || graceDaysLeft < 0 || graceDaysLeft > 2) {
    throw new RangeError('Grace days left must be an integer between 0 and 2');
  }

  await database.runAsync(
    'UPDATE user_state SET grace_days_left = ? WHERE user_id = ?',
    graceDaysLeft,
    localUserId,
  );
}

export async function insertTaskLog(
  database: DatabaseConnection,
  userTaskId: string,
  date: DateString,
  status: Exclude<TaskLogStatus, 'no_entry'>,
  xpAwarded: number,
): Promise<boolean> {
  const result = await database.runAsync(
    `INSERT OR IGNORE INTO task_log (user_task_id, date, status, xp_awarded) VALUES (?, ?, ?, ?)`,
    userTaskId,
    date,
    status,
    xpAwarded,
  );

  return result.changes > 0;
}

export async function hasTaskLog(
  database: DatabaseConnection,
  userTaskId: string,
  date: DateString,
): Promise<Exclude<TaskLogStatus, 'no_entry'> | null> {
  const row = await database.getFirstAsync<{ status: Exclude<TaskLogStatus, 'no_entry'> }>(
    'SELECT status FROM task_log WHERE user_task_id = ? AND date = ? LIMIT 1',
    userTaskId,
    date,
  );

  return row?.status ?? null;
}

export async function listRecentLogs(
  database: DatabaseConnection,
  sinceDate: DateString,
): Promise<readonly LogEntryRow[]> {
  const rows = await database.getAllAsync<LogEntryRow>(
    `SELECT tl.date AS date, tl.status AS status, ut.slot AS slot, ut.category AS category
     FROM task_log tl JOIN user_task ut ON ut.id = tl.user_task_id
     WHERE tl.date >= ?
     ORDER BY tl.date ASC`,
    sinceDate,
  );

  return rows ?? [];
}
