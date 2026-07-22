-- M17 First-Party Connector Suite: 0030_connector_conformance.sql
-- Additive projection for recording conformance run verdicts (AC-X1)

CREATE TABLE IF NOT EXISTS connector_conformance (
    connector_id TEXT NOT NULL,
    suite_version TEXT NOT NULL,
    ac_id TEXT NOT NULL,
    verdict TEXT NOT NULL CHECK (verdict IN ('Pass', 'Fail')),
    reason TEXT,
    executed_at INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (connector_id, suite_version, ac_id)
);
