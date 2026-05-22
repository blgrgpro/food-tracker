import { sql } from "@vercel/postgres";

async function migrate() {
  console.log("Running migrations...");

  await sql`
    CREATE TABLE IF NOT EXISTS items (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(255) NOT NULL,
      quantity   VARCHAR(100),
      status     VARCHAR(20)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'bought')),
      created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS trips (
      id          SERIAL PRIMARY KEY,
      store_name  VARCHAR(255)   NOT NULL,
      total_cost  NUMERIC(10, 2) NOT NULL,
      notes       TEXT,
      created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS trip_items (
      id         SERIAL PRIMARY KEY,
      trip_id    INTEGER      NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      item_name  VARCHAR(255) NOT NULL,
      quantity   VARCHAR(100)
    )
  `;

  console.log("Migrations complete.");
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
