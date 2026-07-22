-- Migration V25: Installed connectors table (M16 Connector Framework)
CREATE TABLE IF NOT EXISTS connectors (
    connector_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    version TEXT NOT NULL,
    publisher TEXT NOT NULL,
    manifest_hash TEXT NOT NULL,
    status TEXT NOT NULL,
    installed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_connectors_status ON connectors(status);
