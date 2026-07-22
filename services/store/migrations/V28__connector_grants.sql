-- Migration V26: Connector grants table (M16 Connector Framework)
-- ADR-0035: Per-department grants primitive (department_id is NOT NULL)
CREATE TABLE IF NOT EXISTS connector_grants (
    connector_id TEXT NOT NULL,
    department_id TEXT NOT NULL,
    scopes TEXT NOT NULL,
    keychain_ref TEXT,
    granted_at TEXT NOT NULL,
    granted_by TEXT NOT NULL,
    revoked_at TEXT,
    PRIMARY KEY (connector_id, department_id)
);

CREATE INDEX IF NOT EXISTS idx_connector_grants_dept ON connector_grants(department_id);
