-- Migration 0056: Template Provenance Table for M25 Firm Templates & Portability
-- Import birth record: at most one row per Vault.

CREATE TABLE IF NOT EXISTS template_provenance (
    vault_id TEXT PRIMARY KEY NOT NULL,
    template_id TEXT NOT NULL REFERENCES firm_templates(template_id),
    template_version TEXT NOT NULL,
    manifest_hash TEXT NOT NULL,
    installing_seat_id TEXT NOT NULL,
    installed_at INTEGER NOT NULL
);
