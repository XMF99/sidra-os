-- M25 Firm Templates and Portability: 0038_firm_templates_and_portability.sql
-- Additive projections for exported and installed firm templates

CREATE TABLE IF NOT EXISTS firm_templates (
    template_id TEXT PRIMARY KEY NOT NULL,
    template_name TEXT NOT NULL,
    template_version TEXT NOT NULL,
    structural_manifest_json TEXT NOT NULL,
    exported_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS template_installations (
    install_id TEXT PRIMARY KEY NOT NULL,
    template_id TEXT NOT NULL,
    installed_by_seat_id TEXT NOT NULL REFERENCES seats(seat_id),
    installed_at INTEGER NOT NULL DEFAULT (unixepoch())
);
