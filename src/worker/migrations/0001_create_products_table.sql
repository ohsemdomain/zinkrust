-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  description TEXT,
  status INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);