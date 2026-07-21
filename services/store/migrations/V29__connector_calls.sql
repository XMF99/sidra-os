-- Migration V29: Connector calls audit projection (M16 Connector Framework)
-- Secrets stripped, metadata digest only
CREATE TABLE IF NOT EXISTS connector_calls (
    call_id TEXT PRIMARY KEY,
    connector_id TEXT NOT NULL,
    department_id TEXT NOT NULL,
    operation_name TEXT NOT NULL,
    effect_class INTEGER NOT NULL,
    host TEXT NOT NULL,
    verdict TEXT NOT NULL,
    latency_ms INTEGER NOT NULL,
    timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_connector_calls_dept ON connector_calls(connector_id, department_id);
CREATE INDEX IF NOT EXISTS idx_connector_calls_ts ON connector_calls(timestamp);
