-- Migration 0050: Sync Devices and Sync Peers Tables for M24 Sync & Conflict Resolution
-- Tracks device identities and peer connections bound to Seats.

CREATE TABLE IF NOT EXISTS sync_devices (
    device_id TEXT PRIMARY KEY NOT NULL,
    seat_id TEXT NOT NULL DEFAULT '',
    pubkey TEXT NOT NULL DEFAULT '',
    registered_at INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE sync_devices ADD COLUMN seat_id TEXT NOT NULL DEFAULT '';
ALTER TABLE sync_devices ADD COLUMN pubkey TEXT NOT NULL DEFAULT '';
ALTER TABLE sync_devices ADD COLUMN registered_at INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_sync_devices_seat ON sync_devices(seat_id);

CREATE TABLE IF NOT EXISTS sync_peers (
    peer_id TEXT PRIMARY KEY NOT NULL,
    device_id TEXT NOT NULL REFERENCES sync_devices(device_id),
    endpoint TEXT NOT NULL,
    last_seen_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sync_peers_device ON sync_peers(device_id);
