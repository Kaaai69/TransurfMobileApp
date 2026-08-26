import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

import { initializeDatabase, type DatabaseConnection } from './migrate';
import { seedCoreTasks } from './seed';

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

describe('core task seed', () => {
  test('writes 30 core and 42 micro templates once and remains idempotent', async () => {
    const sqlite = new DatabaseSync(':memory:');
    const database = new NodeDatabaseConnection(sqlite);

    await initializeDatabase(database);
    await seedCoreTasks(database);
    await seedCoreTasks(database);

    expect(sqlite.prepare('SELECT COUNT(*) AS count FROM task_template').get()).toEqual({
      count: 72,
    });
    expect(
      sqlite.prepare("SELECT COUNT(*) AS count FROM task_template WHERE slot = 'core'").get(),
    ).toEqual({ count: 30 });
    expect(
      sqlite
        .prepare('SELECT COUNT(*) AS count FROM task_template WHERE source_doi IS NOT NULL')
        .get(),
    ).toEqual({ count: 23 });

    sqlite.close();
  });
});
