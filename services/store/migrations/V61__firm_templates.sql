-- Migration 0054: Firm Templates Table for M25 Firm Templates & Portability
-- Records template exports and installs.

CREATE TABLE IF NOT EXISTS firm_templates (
    template_id TEXT PRIMARY KEY NOT NULL,
    template_name TEXT NOT NULL,
    template_version TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'exported', -- exported, installed
    manifest_hash TEXT NOT NULL DEFAULT '',
    publisher_key TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE firm_templates ADD COLUMN kind TEXT NOT NULL DEFAULT 'exported';
ALTER TABLE firm_templates ADD COLUMN manifest_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE firm_templates ADD COLUMN publisher_key TEXT NOT NULL DEFAULT '';
ALTER TABLE firm_templates ADD COLUMN created_at INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_firm_templates_kind ON firm_templates(kind);
