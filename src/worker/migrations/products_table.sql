-- Migration number: 0001 	 2025-05-29T14:21:41.918Z
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category INTEGER NOT NULL, -- 1=Packaging, 2=Label, 3=Other (define in constants)
    price_cents INTEGER NOT NULL,
    description TEXT,
    status INTEGER DEFAULT 1, -- 0=inactive, 1=active (define in constants)
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_products_status ON products(status);

