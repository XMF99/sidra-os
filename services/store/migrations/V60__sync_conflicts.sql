-- Migration 0053: Sync Conflicts Table for M24 Sync & Conflict Resolution
-- Links projection cell forks to Decision Engine `decisions` rows.

CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS sync_conflicts (
    conflict_id TEXT PRIMARY KEY NOT NULL,
    decision_id TEXT NOT NULL REFERENCES decisions(id),
    projection_cell TEXT NOT NULL DEFAULT '',
    fork_event_a TEXT NOT NULL DEFAULT '',
    fork_event_b TEXT NOT NULL DEFAULT '',
    provisional_winner TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'PENDING',
    detected_at INTEGER NOT NULL DEFAULT (unixepoch()),
    resolved_at INTEGER
);

ALTER TABLE sync_conflicts ADD COLUMN projection_cell TEXT NOT NULL DEFAULT '';
ALTER TABLE sync_conflicts ADD COLUMN fork_event_a TEXT NOT NULL DEFAULT '';
ALTER TABLE sync_conflicts ADD COLUMN fork_event_b TEXT NOT NULL DEFAULT '';
ALTER TABLE sync_conflicts ADD COLUMN provisional_winner TEXT NOT NULL DEFAULT '';
ALTER TABLE sync_conflicts ADD COLUMN resolved_at INTEGER;

CREATE INDEX IF NOT EXISTS idx_sync_conflicts_decision ON sync_conflicts(decision_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_cell ON sync_conflicts(projection_cell);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_status ON sync_conflicts(status);
