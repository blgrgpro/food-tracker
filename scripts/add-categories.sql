-- Run each line separately in the Neon Query console
ALTER TABLE items ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE trip_items ADD COLUMN IF NOT EXISTS category TEXT;
