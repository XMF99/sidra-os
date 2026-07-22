-- Migration 0053: Sync Conflicts Table for M24 Sync & Conflict Resolution
-- Links projection cell forks to Decision Engine `decisions` rows.

CREATE TABLE IF NOT EXISTS sync_conflicts (
    conflict_id TEXT PRIMARY KEY NOT NULL,
    decision_id TEXT NOT NULL REFERENCES decisions(id),
    projection_cell TEXT NOT NULL,
    fork_event_a TEXT NOT NULL REFERENCES events(id),
    fork_event_b TEXT NOT NULL REFERENCES events(id),
    provisional_winner TEXT NOT NULL,
    status TEXT NOT NULL, -- PENDING, RESOLVED
    detected_at INTEGER NOT NULL,
    resolved_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_sync_conflicts_decision ON sync_conflicts(decision_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_cell ON sync_conflicts(projection_cell);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_status ON sync_conflicts(status);
