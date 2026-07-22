-- M13 Departments: 0015_registries.sql
-- Creates registry_entries table (owner NOT NULL, append-only, no delete per ADR-0017)

CREATE TABLE IF NOT EXISTS registry_entries (
    entry_id TEXT PRIMARY KEY,
    namespace TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    owner TEXT NOT NULL REFERENCES department_packs(id), -- NOT NULL owner constraint (ADR-0017)
    status TEXT NOT NULL DEFAULT 'active',
    revised_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_registry_ns_key ON registry_entries(namespace, key);
