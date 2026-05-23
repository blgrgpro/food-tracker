import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    if (!connectionString) throw new Error("No database connection string set (DATABASE_URL or POSTGRES_URL)");
    _sql = neon(connectionString);
  }
  return _sql;
}

// Proxy target must be callable for the apply trap to fire on tagged template calls
export const sql = new Proxy(
  (function () {}) as unknown as NeonQueryFunction<false, false>,
  {
    apply(_target, _thisArg, args) {
      return (getSql() as unknown as (...a: unknown[]) => unknown)(...args);
    },
    get(_target, prop) {
      return (getSql() as unknown as Record<string | symbol, unknown>)[prop];
    },
  }
);

export type ItemStatus = "pending" | "bought";

export interface Item {
  id: number;
  name: string;
  quantity: string | null;
  price: number | null;
  category: string | null;
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
  price: number | null;
  category: string | null;
}

export interface CategoryStat {
  category: string;
  total: number;
  item_count: number;
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
