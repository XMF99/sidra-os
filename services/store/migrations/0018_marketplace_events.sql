-- M14 Game Studio and Marketplace: 0018_marketplace_events.sql
-- Creates marketplace_events audit projection table (no credentials stored)

CREATE TABLE IF NOT EXISTS marketplace_events (
    event_id TEXT PRIMARY KEY,
    event_kind TEXT NOT NULL CHECK (event_kind IN ('acquired', 'installed', 'granted', 'uninstalled')),
    pack_id TEXT NOT NULL,
    actor TEXT NOT NULL,
    outcome TEXT NOT NULL,
    occurred_at INTEGER NOT NULL DEFAULT (unixepoch())
);
