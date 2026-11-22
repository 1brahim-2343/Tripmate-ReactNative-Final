import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "tripmate.db";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS trips (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          destinationId TEXT,
          city TEXT NOT NULL,
          country TEXT NOT NULL,
          coverImage TEXT,
          startDate TEXT NOT NULL,
          endDate TEXT NOT NULL,
          totalBudget REAL NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'upcoming',
          createdAt TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS activities (
          id TEXT PRIMARY KEY NOT NULL,
          tripId TEXT NOT NULL,
          dayNumber INTEGER NOT NULL,
          time TEXT NOT NULL,
          title TEXT NOT NULL,
          location TEXT,
          notes TEXT,
          category TEXT NOT NULL DEFAULT 'other',
          FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS expenses (
          id TEXT PRIMARY KEY NOT NULL,
          tripId TEXT NOT NULL,
          category TEXT NOT NULL,
          title TEXT NOT NULL,
          amount REAL NOT NULL,
          date TEXT NOT NULL,
          FOREIGN KEY (tripId) REFERENCES trips(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS favorites (
          destinationId TEXT PRIMARY KEY NOT NULL,
          savedAt TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS journal (
          id TEXT PRIMARY KEY NOT NULL,
          tripId TEXT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          imageUri TEXT,
          locationName TEXT,
          createdAt TEXT NOT NULL
        );
      `);

      return db;
    })().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }

  return dbPromise;
}
