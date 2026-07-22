-- M16 Connector Framework: 0029_connector_events.sql
-- Audit log projection for connector invocations and grant changes

CREATE TABLE IF NOT EXISTS connector_events (
    event_id TEXT PRIMARY KEY,
    connector_id TEXT NOT NULL,
    department_id TEXT NOT NULL,
    action TEXT NOT NULL,
    occurred_at INTEGER NOT NULL DEFAULT (unixepoch())
);
