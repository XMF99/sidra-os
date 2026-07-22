-- Migration 0052: Additive Event Provenance Columns & Merge Log for M24
-- Additive nullable columns on `events` table to support multi-device provenance.
-- A single-device pre-M24 Vault remains 100% byte-identical.

ALTER TABLE events ADD COLUMN device_id TEXT;
ALTER TABLE events ADD COLUMN device_seq INTEGER;
ALTER TABLE events ADD COLUMN hlc_wall INTEGER;
ALTER TABLE events ADD COLUMN hlc_counter INTEGER;
ALTER TABLE events ADD COLUMN sig TEXT;
ALTER TABLE events ADD COLUMN supersedes_event TEXT;

CREATE TABLE IF NOT EXISTS merge_log (
    merge_id TEXT PRIMARY KEY NOT NULL,
    peer_id TEXT NOT NULL,
    admitted_count INTEGER NOT NULL,
    frontier_order_key TEXT NOT NULL,
    merged_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_device_provenance ON events(device_id, device_seq);
CREATE INDEX IF NOT EXISTS idx_events_supersedes ON events(supersedes_event) WHERE supersedes_event IS NOT NULL;
