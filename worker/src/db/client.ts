import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const sqlitePath = process.env.SQLITE_PATH ?? './worker-data.sqlite';

export const sqlite = new Database(sqlitePath);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite);
