-- Migration 0055: Template Manifest Table for M25 Firm Templates & Portability
-- Stores template manifest projection (org chart, PackRef list, structural Canon ids, attestation).

CREATE TABLE IF NOT EXISTS template_manifests (
    template_id TEXT PRIMARY KEY NOT NULL REFERENCES firm_templates(template_id),
    org_chart_json TEXT NOT NULL,
    pack_refs_json TEXT NOT NULL,
    structural_canon_ids_json TEXT NOT NULL,
    attestation_digest TEXT NOT NULL,
    stored_at INTEGER NOT NULL
);
