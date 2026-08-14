import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import { initializeDatabase } from './migrate';
import { schema } from './schema';

export const sqlite = openDatabaseSync('transurf.db');
export const database = drizzle(sqlite, { schema });
export const databaseReady = initializeDatabase(sqlite);

export type AppDatabase = typeof database;
