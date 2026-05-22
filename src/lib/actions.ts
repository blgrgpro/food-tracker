"use server";

import { revalidatePath } from "next/cache";
import { sql } from "./db";
import type { Item, Trip, TripItem, TripWithItems, MonthlyStats } from "./db";

// ─── Items ────────────────────────────────────────────────────────────────────

export async function getItems(): Promise<Item[]> {
  const rows = await sql`SELECT * FROM items ORDER BY created_at DESC`;
  return rows as Item[];
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
  await sql`UPDATE items SET status = ${newStatus} WHERE id = ${id}`;
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

export async function updateItem(
  id: number,
  name: string,
  quantity: string | null,
  price: number | null
): Promise<void> {
  await sql`
    UPDATE items SET name = ${name.trim()}, quantity = ${quantity?.trim() || null}, price = ${price}
    WHERE id = ${id}
  `;
  revalidatePath("/");
}

// ─── Trips ────────────────────────────────────────────────────────────────────

export async function getTrips(): Promise<Trip[]> {
  const rows = await sql`SELECT * FROM trips ORDER BY created_at DESC`;
  return rows as Trip[];
}

export async function getTripWithItems(id: number): Promise<TripWithItems | null> {
  const trips = await sql`SELECT * FROM trips WHERE id = ${id}`;
  if (trips.length === 0) return null;

  const trip = trips[0] as Trip;
  const items = await sql`SELECT * FROM trip_items WHERE trip_id = ${id} ORDER BY id`;

  return { ...trip, items: items as TripItem[] };
}

export async function createTrip(formData: FormData): Promise<{ id: number }> {
  const storeName = formData.get("store_name") as string;
  const totalCost = parseFloat(formData.get("total_cost") as string);
  const notes = (formData.get("notes") as string) || null;

  if (!storeName?.trim() || isNaN(totalCost)) {
    throw new Error("Store name and total cost are required");
  }

  const tripRows = await sql`
    INSERT INTO trips (store_name, total_cost, notes)
    VALUES (${storeName.trim()}, ${totalCost}, ${notes?.trim() || null})
    RETURNING id
  `;
  const tripId = (tripRows[0] as { id: number }).id;

  await sql`
    INSERT INTO trip_items (trip_id, item_name, quantity, price)
    SELECT ${tripId}, name, quantity, price FROM items WHERE status = 'bought'
  `;

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
  const rows = await sql`
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
  return rows as MonthlyStats[];
}

export async function getTotalStats(): Promise<{
  total_trips: number;
  total_spent: number;
  avg_trip_cost: number;
}> {
  const rows = await sql`
    SELECT
      COUNT(*)::int                       AS total_trips,
      COALESCE(SUM(total_cost), 0)::float AS total_spent,
      COALESCE(AVG(total_cost), 0)::float AS avg_trip_cost
    FROM trips
  `;
  return rows[0] as { total_trips: number; total_spent: number; avg_trip_cost: number };
}
