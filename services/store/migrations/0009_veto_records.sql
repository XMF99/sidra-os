-- M12 Structure: 0009_veto_records.sql
-- Creates veto_records table for audit logging & veto rate calculation

CREATE TABLE IF NOT EXISTS veto_records (
    veto_id TEXT PRIMARY KEY,
    office_id TEXT NOT NULL REFERENCES offices(id),
    scope TEXT NOT NULL,
    subject_type TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    author_division TEXT NOT NULL,
    reviewer_agent_id TEXT NOT NULL,
    verdict TEXT NOT NULL, -- 'upheld' or 'overridden'
    overridden_by TEXT,
    dissent_id TEXT,
    invoked_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_veto_records_office ON veto_records(office_id);
