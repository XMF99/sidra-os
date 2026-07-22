-- Migration V28: Connector egress projection (M16 Connector Framework)
-- ADR-0036: Compiled host allowlist projection
CREATE TABLE IF NOT EXISTS connector_egress (
    connector_id TEXT NOT NULL,
    department_id TEXT NOT NULL DEFAULT '__default__',
    host TEXT NOT NULL,
    effect_class INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (connector_id, department_id, host)
);

ALTER TABLE connector_egress ADD COLUMN department_id TEXT NOT NULL DEFAULT '__default__';
ALTER TABLE connector_egress ADD COLUMN effect_class INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_connector_egress_lookup ON connector_egress(connector_id, department_id);
