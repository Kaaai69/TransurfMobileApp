import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

import { initializeDatabase, type DatabaseConnection } from './migrate';

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

  async runAsync(source: string, ...params: readonly unknown[]) {
    const result = this.database.prepare(source).run(...(params as SQLInputValue[]));

    return {
      changes: Number(result.changes),
      lastInsertRowId: Number(result.lastInsertRowid),
    };
  }
}

describe('database initialization', () => {
  test('migrates an empty database and completes a write/read smoke check', async () => {
    const sqlite = new DatabaseSync(':memory:');
    const database = new NodeDatabaseConnection(sqlite);

    await expect(initializeDatabase(database)).resolves.toBeUndefined();

    const tables = sqlite
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      )
      .all()
      .map((row) => row.name);
    const version = sqlite.prepare('PRAGMA user_version').get();
    const temporarySmokeTable = sqlite
      .prepare(
        "SELECT name FROM sqlite_temp_master WHERE type = 'table' AND name = '_transurf_smoke'",
      )
      .get();

    expect(tables).toEqual(['task_log', 'task_template', 'user_flags', 'user_state', 'user_task']);
    expect(version).toEqual({ user_version: 1 });
    expect(temporarySmokeTable).toBeUndefined();

    sqlite.close();
  });

  test('rejects an update that would decrease persisted XP', async () => {
    const sqlite = new DatabaseSync(':memory:');
    const database = new NodeDatabaseConnection(sqlite);

    await initializeDatabase(database);
    sqlite
      .prepare(
        `INSERT INTO user_state (
          user_id, sleep, energy, movement, food, water, mind,
          baseline_sleep, baseline_energy, baseline_movement, baseline_food, baseline_water,
          baseline_mind, recalculated_at, level_xp, grace_days_left, grace_window_start
        ) VALUES (?, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, ?, 10, 2, ?)`,
      )
      .run('local', '2026-08-14T00:00:00.000Z', '2026-08-14');

    expect(() =>
      sqlite.prepare('UPDATE user_state SET level_xp = 9 WHERE user_id = ?').run('local'),
    ).toThrow('level_xp cannot decrease');

    sqlite.close();
  });
});
