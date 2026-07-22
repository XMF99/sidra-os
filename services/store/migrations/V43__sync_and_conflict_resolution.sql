-- M24 Sync and Conflict Resolution: 0037_sync_and_conflict_resolution.sql
-- Additive projections for multi-device sync, per-device streams, and projection conflict decisions

CREATE TABLE IF NOT EXISTS sync_devices (
    device_id TEXT PRIMARY KEY NOT NULL,
    last_known_seq INTEGER NOT NULL DEFAULT 0,
    last_synced_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS sync_conflicts (
    conflict_id TEXT PRIMARY KEY NOT NULL,
    target_table TEXT NOT NULL,
    target_row_id TEXT NOT NULL,
    target_column TEXT NOT NULL,
    winning_value_json TEXT NOT NULL,
    contested_value_json TEXT NOT NULL,
    decision_id TEXT NOT NULL REFERENCES decisions(id),
    status TEXT NOT NULL CHECK (status IN ('contested', 'resolved')) DEFAULT 'contested',
    detected_at INTEGER NOT NULL DEFAULT (unixepoch())
);
