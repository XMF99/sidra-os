-- Migration 0051: Sync Cursors Table for M24 Sync & Conflict Resolution
-- Tracks per-peer version-vector frontiers.

CREATE TABLE IF NOT EXISTS sync_cursors (
    peer_id TEXT NOT NULL REFERENCES sync_peers(peer_id),
    target_device_id TEXT NOT NULL,
    last_admitted_seq INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (peer_id, target_device_id)
);

CREATE INDEX IF NOT EXISTS idx_sync_cursors_peer ON sync_cursors(peer_id);
