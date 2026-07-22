-- M16 Connector Framework: 0025_connector_manifests.sql
-- Manifest projection table for installed connectors (ADR-0034)

CREATE TABLE IF NOT EXISTS connector_manifests (
    connector_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    provider TEXT NOT NULL,
    egress_hosts TEXT NOT NULL,
    installed_at INTEGER NOT NULL DEFAULT (unixepoch())
);
