-- Grocery Tracker — database setup
-- Run once on your Vercel Postgres database.
-- Copy-paste into the Vercel Postgres Query console, or run via psql.

CREATE TABLE IF NOT EXISTS items (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  quantity   VARCHAR(100),
  status     VARCHAR(20)  NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'bought')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trips (
  id          SERIAL PRIMARY KEY,
  store_name  VARCHAR(255)   NOT NULL,
  total_cost  NUMERIC(10, 2) NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trip_items (
  id         SERIAL PRIMARY KEY,
  trip_id    INTEGER      NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  item_name  VARCHAR(255) NOT NULL,
  quantity   VARCHAR(100)
);

-- Optional indexes
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trip_items_trip_id ON trip_items(trip_id);
