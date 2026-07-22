-- M14 Game Studio and Marketplace: 0016_marketplace_listings.sql
-- Creates marketplace_listings table (catalogue projection, holds origin_line, no credentials)

CREATE TABLE IF NOT EXISTS marketplace_listings (
    pack_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    origin_line TEXT NOT NULL, -- CCGS MIT origin line (AC-L1)
    signature TEXT NOT NULL,
    published_at INTEGER NOT NULL DEFAULT (unixepoch())
);
