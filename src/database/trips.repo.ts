import { getDatabase } from "./db";
import { Activity, Trip } from "../types";

export const tripsRepo = {
  // favorites table

  async getFavoriteIds(): Promise<string[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ destinationId: string }>(
      "SELECT destinationId FROM favorites ORDER BY savedAt DESC",
    );
    return rows.map((row) => row.destinationId);
  },

  async isFavorite(destinationId: string): Promise<boolean> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ destinationId: string }>(
      "SELECT destinationId FROM favorites WHERE destinationId = ?",
      [destinationId],
    );
    return Boolean(row);
  },

  async toggleFavorite(destinationId: string): Promise<boolean> {
    const db = await getDatabase();
    const exists = await this.isFavorite(destinationId);

    if (exists) {
      await db.runAsync("DELETE FROM favorites WHERE destinationId = ?", [
        destinationId,
      ]);
      return false;
    }

    await db.runAsync(
      "INSERT INTO favorites (destinationId, savedAt) VALUES (?, ?)",
      [destinationId, new Date().toISOString()],
    );
    return true;
  },

  //   trips table

  async getAllTrips(): Promise<Trip[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Trip>(
      "SELECT * FROM trips ORDER BY startDate ASC",
    );
  },

  async getTripById(id: string): Promise<Trip | null> {
    const db = await getDatabase();
    return await db.getFirstAsync<Trip>("SELECT * FROM trips WHERE id = ?", [
      id,
    ]);
  },

  async createTrip(trip: Trip): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO trips (
        id, title, destinationId, city, country, coverImage,
        startDate, endDate, totalBudget, status, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trip.id,
        trip.title,
        trip.destinationId ?? null,
        trip.city,
        trip.country,
        trip.coverImage ?? null,
        trip.startDate,
        trip.endDate,
        trip.totalBudget,
        trip.status,
        trip.createdAt,
      ],
    );
  },

  async updateTrip(trip: Trip): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE trips SET
        title = ?,
        destinationId = ?,
        city = ?,
        country = ?,
        coverImage = ?,
        startDate = ?,
        endDate = ?,
        totalBudget = ?,
        status = ?
      WHERE id = ?`,
      [
        trip.title,
        trip.destinationId ?? null,
        trip.city,
        trip.country,
        trip.coverImage ?? null,
        trip.startDate,
        trip.endDate,
        trip.totalBudget,
        trip.status,
        trip.id,
      ],
    );
  },

  async deleteTrip(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM trips WHERE id = ?", [id]);
  },

  //   activities table

  async getActivitiesByTripId(tripId: string): Promise<Activity[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Activity>(
      "SELECT * FROM activities WHERE tripId = ? ORDER BY dayNumber ASC, time ASC",
      [tripId],
    );
  },

  async createActivity(activity: Activity): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO activities (
        id, tripId, dayNumber, time, title, location, notes, category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        activity.id,
        activity.tripId,
        activity.dayNumber,
        activity.time,
        activity.title,
        activity.location ?? null,
        activity.notes ?? null,
        activity.category,
      ],
    );
  },

  async deleteActivity(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync("DELETE FROM activities WHERE id = ?", [id]);
  },
};
