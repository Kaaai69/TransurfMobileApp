import migrations from '../../drizzle/migrations';

export interface DatabaseConnection {
  execAsync(source: string): Promise<void>;
  getFirstAsync<T>(source: string, ...params: unknown[]): Promise<T | null>;
  getAllAsync<T>(source: string, ...params: unknown[]): Promise<T[]>;
  runAsync(
    source: string,
    ...params: unknown[]
  ): Promise<{ changes: number; lastInsertRowId: number }>;
}

const migrationSql = migrations.journal.entries.map((entry) => {
  const source = migrations.migrations[`m${entry.idx.toString().padStart(4, '0')}`];

  if (source === undefined) {
    throw new Error(`Missing database migration ${entry.tag}`);
  }

  return source;
});
const databaseVersion = migrationSql.length;

async function runSmokeTest(database: DatabaseConnection) {
  await database.execAsync(
    'CREATE TEMP TABLE _transurf_smoke (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL);',
  );

  try {
    await database.runAsync('INSERT INTO _transurf_smoke (value) VALUES (?)', 'ready');
    const row = await database.getFirstAsync<{ value: string }>(
      'SELECT value FROM _transurf_smoke LIMIT 1',
    );

    if (row?.value !== 'ready') {
      throw new Error('Database smoke check returned an unexpected value');
    }
  } finally {
    await database.execAsync('DROP TABLE IF EXISTS _transurf_smoke;');
  }
}

export async function initializeDatabase(database: DatabaseConnection) {
  await database.execAsync('PRAGMA journal_mode = WAL;');
  await database.execAsync('PRAGMA foreign_keys = ON;');

  const versionRow = await database.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion > databaseVersion) {
    throw new Error(
      `Database version ${currentVersion} is newer than supported ${databaseVersion}`,
    );
  }

  for (let index = currentVersion; index < databaseVersion; index += 1) {
    const source = migrationSql[index];

    if (source === undefined) {
      throw new Error(`Missing database migration ${index}`);
    }

    await database.execAsync(source);
    await database.execAsync(`PRAGMA user_version = ${index + 1};`);
  }

  await runSmokeTest(database);
}
