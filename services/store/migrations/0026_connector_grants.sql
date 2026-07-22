-- M16 Connector Framework: 0026_connector_grants.sql
-- Department-specific connector grants (ADR-0035)

CREATE TABLE IF NOT EXISTS connector_grants (
    grant_id TEXT PRIMARY KEY,
    connector_id TEXT NOT NULL,
    department_id TEXT NOT NULL,
    scopes TEXT NOT NULL,
    granted_at INTEGER NOT NULL DEFAULT (unixepoch()),
    FOREIGN KEY (connector_id) REFERENCES connector_manifests(connector_id)
);
