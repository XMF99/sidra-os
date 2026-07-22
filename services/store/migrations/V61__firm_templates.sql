-- Migration 0054: Firm Templates Table for M25 Firm Templates & Portability
-- Records template exports and installs.

CREATE TABLE IF NOT EXISTS firm_templates (
    template_id TEXT PRIMARY KEY NOT NULL,
    template_name TEXT NOT NULL,
    template_version TEXT NOT NULL,
    kind TEXT NOT NULL, -- exported, installed
    manifest_hash TEXT NOT NULL,
    publisher_key TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_firm_templates_kind ON firm_templates(kind);
