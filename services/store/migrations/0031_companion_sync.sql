-- M18 Companion Mobile Surface: 0031_companion_sync.sql
-- Additive schema projections for paired companion devices, outbox entries, and brief render cache

CREATE TABLE IF NOT EXISTS companion_devices (
    device_id TEXT PRIMARY KEY NOT NULL,
    device_pubkey TEXT NOT NULL,
    paired_at INTEGER NOT NULL DEFAULT (unixepoch()),
    paired_by TEXT NOT NULL,
    label TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'revoked')) DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS companion_outbox (
    outbox_entry_id TEXT PRIMARY KEY NOT NULL,
    approval_request_id TEXT NOT NULL,
    verdict TEXT NOT NULL CHECK (verdict IN ('approved', 'rejected')),
    grant_scope TEXT,
    decided_at INTEGER NOT NULL,
    device_id TEXT NOT NULL REFERENCES companion_devices(device_id),
    signature TEXT NOT NULL,
    reconciled_at INTEGER,
    reconciliation_status TEXT CHECK (reconciliation_status IN ('reconciled', 'duplicate', 'stale', 'untrusted'))
);

CREATE TABLE IF NOT EXISTS brief_render_cache (
    brief_id TEXT PRIMARY KEY NOT NULL,
    canonical_payload_json TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    rendered_at INTEGER NOT NULL DEFAULT (unixepoch())
);
