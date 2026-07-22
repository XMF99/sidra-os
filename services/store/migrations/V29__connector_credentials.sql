-- M16 Connector Framework: 0027_connector_credentials.sql
-- Credential custody table (held by kernel, ADR-0034)

CREATE TABLE IF NOT EXISTS connector_credentials (
    connector_id TEXT PRIMARY KEY,
    vault_key TEXT NOT NULL,
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (connector_id) REFERENCES connector_manifests(connector_id)
);
