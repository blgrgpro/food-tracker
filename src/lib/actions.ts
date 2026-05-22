"use server";

import { revalidatePath } from "next/cache";
import { sql } from "./db";
import type { Item, Trip, TripItem, TripWithItems, MonthlyStats } from "./db";

// ─── Items ────────────────────────────────────────────────────────────────────

export async function getItems(): Promise<Item[]> {
  const result = await sql<Item>`
    SELECT * FROM items ORDER BY created_at DESC
  `;
  return result.rows;
}

export async function addItem(formData: FormData): Promise<void> {
  const name = formData.get("name") as string;
  const quantity = (formData.get("quantity") as string) || null;
  const priceRaw = formData.get("price") as string;
  const price = priceRaw ? parseFloat(priceRaw) : null;

  if (!name?.trim()) return;

  await sql`
    INSERT INTO items (name, quantity, price, status)
    VALUES (${name.trim()}, ${quantity?.trim() || null}, ${price ?? null}, 'pending')
  `;
  revalidatePath("/");
}

export async function toggleItem(id: number, status: "pending" | "bought"): Promise<void> {
  const newStatus = status === "pending" ? "bought" : "pending";
  await sql`
    UPDATE items SET status = ${newStatus} WHERE id = ${id}
  `;
  revalidatePath("/");
}

export async function deleteItem(id: number): Promise<void> {
  await sql`DELETE FROM items WHERE id = ${id}`;
  revalidatePath("/");
}

export async function clearBoughtItems(): Promise<void> {
  await sql`DELETE FROM items WHERE status = 'bought'`;
  revalidatePath("/");
}

// ─── Trips ────────────────────────────────────────────────────────────────────

export async function getTrips(): Promise<Trip[]> {
  const result = await sql<Trip>`
    SELECT * FROM trips ORDER BY created_at DESC
  `;
  return result.rows;
}

export async function getTripWithItems(id: number): Promise<TripWithItems | null> {
  const tripResult = await sql<Trip>`
    SELECT * FROM trips WHERE id = ${id}
  `;
  if (tripResult.rows.length === 0) return null;

  const trip = tripResult.rows[0];
  const itemsResult = await sql<TripItem>`
    SELECT * FROM trip_items WHERE trip_id = ${id} ORDER BY id
  `;

  return { ...trip, items: itemsResult.rows };
}

export async function createTrip(formData: FormData): Promise<{ id: number }> {
  const storeName = formData.get("store_name") as string;
  const totalCost = parseFloat(formData.get("total_cost") as string);
  const notes = (formData.get("notes") as string) || null;

  if (!storeName?.trim() || isNaN(totalCost)) {
    throw new Error("Store name and total cost are required");
  }

  // Insert trip
  const tripResult = await sql<{ id: number }>`
    INSERT INTO trips (store_name, total_cost, notes)
    VALUES (${storeName.trim()}, ${totalCost}, ${notes?.trim() || null})
    RETURNING id
  `;
  const tripId = tripResult.rows[0].id;

  // Copy bought items to trip_items
  await sql`
    INSERT INTO trip_items (trip_id, item_name, quantity, price)
    SELECT ${tripId}, name, quantity, price FROM items WHERE status = 'bought'
  `;

  // Remove bought items from active list
  await sql`DELETE FROM items WHERE status = 'bought'`;

  revalidatePath("/");
  revalidatePath("/trips");
  revalidatePath("/analytics");

  return { id: tripId };
}

export async function deleteTrip(id: number): Promise<void> {
  await sql`DELETE FROM trips WHERE id = ${id}`;
  revalidatePath("/trips");
  revalidatePath("/analytics");
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function getMonthlyStats(): Promise<MonthlyStats[]> {
  const result = await sql<MonthlyStats>`
    SELECT
      EXTRACT(YEAR FROM created_at)::int  AS year,
      EXTRACT(MONTH FROM created_at)::int AS month,
      SUM(total_cost)::float              AS total_spent,
      COUNT(*)::int                       AS trip_count,
      AVG(total_cost)::float              AS avg_cost
    FROM trips
    GROUP BY year, month
    ORDER BY year DESC, month DESC
    LIMIT 12
  `;
  return result.rows;
}

export async function getTotalStats(): Promise<{
  total_trips: number;
  total_spent: number;
  avg_trip_cost: number;
}> {
  const result = await sql`
    SELECT
      COUNT(*)::int        AS total_trips,
      COALESCE(SUM(total_cost), 0)::float AS total_spent,
      COALESCE(AVG(total_cost), 0)::float AS avg_trip_cost
    FROM trips
  `;
  return result.rows[0] as { total_trips: number; total_spent: number; avg_trip_cost: number };
}
