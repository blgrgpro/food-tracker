import { sql } from "@vercel/postgres";

export { sql };

export type ItemStatus = "pending" | "bought";

export interface Item {
  id: number;
  name: string;
  quantity: string | null;
  status: ItemStatus;
  created_at: string;
}

export interface Trip {
  id: number;
  store_name: string;
  total_cost: number;
  notes: string | null;
  created_at: string;
}

export interface TripItem {
  id: number;
  trip_id: number;
  item_name: string;
  quantity: string | null;
}

export interface TripWithItems extends Trip {
  items: TripItem[];
}

export interface MonthlyStats {
  year: number;
  month: number;
  total_spent: number;
  trip_count: number;
  avg_cost: number;
}
