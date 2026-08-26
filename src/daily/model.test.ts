import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

import { initializeDatabase, type DatabaseConnection } from '../db/migrate';
import { ensureCoreUserTask, getUserStateRow, saveUserProfile } from '../db/repo';
import { seedCoreTasks } from '../db/seed';
import { addDays, today as todayISO } from '../domain/dates';
import { loadDailySnapshot, markCoreDone, markMicroDone } from './model';
import { readChainState, sanitizeChainState } from './chain';

class NodeDatabaseConnection implements DatabaseConnection {
  constructor(private readonly database: DatabaseSync) {}

  async execAsync(source: string) {
    this.database.exec(source);
  }

  async getFirstAsync<T>(source: string, ...params: readonly unknown[]) {
    return (
      (this.database.prepare(source).get(...(params as SQLInputValue[])) as T | undefined) ?? null
    );
  }

  async getAllAsync<T>(source: string, ...params: readonly unknown[]) {
    return this.database.prepare(source).all(...(params as SQLInputValue[])) as T[];
  }

  async runAsync(source: string, ...params: readonly unknown[]) {
    const result = this.database.prepare(source).run(...(params as SQLInputValue[]));

    return {
      changes: Number(result.changes),
      lastInsertRowId: Number(result.lastInsertRowid),
    };
  }
}

const memoryStorage = () => {
  const map = new Map<string, string>();

  return {
    getItem: async (key: string) => map.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      map.set(key, value);
    },
  };
};

describe('daily snapshot and marking', () => {
  test('marks update state and XP monotonically and stay idempotent', async () => {
    const sqlite = new DatabaseSync(':memory:');
    const database = new NodeDatabaseConnection(sqlite);
    const storage = memoryStorage();
    const start = todayISO();

    await initializeDatabase(database);
    await seedCoreTasks(database);

    const baseline = { sleep: 50, energy: 50, movement: 50, food: 50, water: 50, mind: 50 };

    await saveUserProfile(database, {
      baseline,
      scores: baseline,
      budgetMinutes: 15,
      today: start,
    });
    await ensureCoreUserTask(database, 'sleep-1', start);

    const chain = sanitizeChainState(undefined);

    const before = await loadDailySnapshot(database, chain);

    expect(before?.core.doneToday).toBe(false);
    expect(before?.levelXp).toBe(0);
    expect(before?.dayNumber).toBe(1);
    expect(before?.micro).not.toBeNull();
    expect(before?.micro?.category).not.toBe('sleep');

    expect(await markCoreDone(database, storage)).toBe(true);
    expect(await markCoreDone(database, storage)).toBe(false);

    const after = await loadDailySnapshot(database, await readChainState(storage));

    expect(after?.core.doneToday).toBe(true);
    expect(after?.levelXp).toBe(10);
    expect(after?.state.sleep).toBeCloseTo(52, 5);
    expect(after?.state.energy).toBeGreaterThan(baseline.energy);

    expect(await markMicroDone(database, before?.micro?.templateId ?? '')).toBe(true);
    const afterMicro = await loadDailySnapshot(database, await readChainState(storage));

    expect(afterMicro?.levelXp).toBe(15);
    expect(afterMicro?.micro?.doneToday).toBe(true);

    const persisted = await getUserStateRow(database);

    expect(persisted?.graceDaysLeft).toBe(2);
    sqlite.close();
  });

  test('missed days keep XP untouched and report the day number honestly', async () => {
    const sqlite = new DatabaseSync(':memory:');
    const database = new NodeDatabaseConnection(sqlite);
    const start = addDays(todayISO(), -4);

    await initializeDatabase(database);
    await seedCoreTasks(database);

    const baseline = { sleep: 40, energy: 40, movement: 40, food: 40, water: 40, mind: 40 };

    await saveUserProfile(database, {
      baseline,
      scores: baseline,
      budgetMinutes: 15,
      today: start,
    });
    await ensureCoreUserTask(database, 'sleep-1', start);

    const snapshot = await loadDailySnapshot(database, sanitizeChainState(undefined));

    expect(snapshot?.dayNumber).toBe(5);
    expect(snapshot?.graceDaysLeft).toBe(2);
    expect(snapshot?.levelXp).toBe(0);

    sqlite.close();
  });
});
