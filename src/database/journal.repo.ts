import { getDatabase } from "./db";
import { JournalEntry } from "../types";

export const journalRepo = {
  async getAllEntries(): Promise<JournalEntry[]> {
    const db = await getDatabase();
    return await db.getAllAsync<JournalEntry>(
      "SELECT * FROM journal WHERE title != '__TRIP_PHOTO__' ORDER BY createdAt DESC",
    );
  },

  async createEntry(entry: JournalEntry): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO journal (id, tripId, title, content, imageUri, locationName, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.id,
        entry.tripId ?? null,
        entry.title,
        entry.content,
        entry.imageUri ?? null,
        entry.locationName ?? null,
        entry.createdAt,
      ],
    );
  },

  async deleteEntry(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM journal WHERE id = ?", [id]);
  },

  async getPhotosByTripId(tripId: string): Promise<JournalEntry[]> {
    const db = await getDatabase();
    return await db.getAllAsync<JournalEntry>(
      "SELECT * FROM journal WHERE tripId = ? AND imageUri IS NOT NULL ORDER BY createdAt DESC",
      [tripId],
    );
  },
};