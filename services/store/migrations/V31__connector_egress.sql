-- M16 Connector Framework: 0028_connector_egress.sql
-- Kernel egress inspection & declaration tracking (ADR-0036)

CREATE TABLE IF NOT EXISTS connector_egress (
    connector_id TEXT NOT NULL,
    host TEXT NOT NULL,
    port INTEGER NOT NULL DEFAULT 443,
    status TEXT NOT NULL CHECK (status IN ('allowed', 'blocked')),
    PRIMARY KEY (connector_id, host),
    FOREIGN KEY (connector_id) REFERENCES connector_manifests(connector_id)
);
