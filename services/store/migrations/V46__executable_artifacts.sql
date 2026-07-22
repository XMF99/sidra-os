-- M20 Executable Artifacts: 0039_executable_artifacts.sql
-- Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §11.1, ADR-0056

CREATE TABLE IF NOT EXISTS executable_artifacts (
    artifact_id TEXT PRIMARY KEY NOT NULL,
    producing_work_order_id TEXT NOT NULL REFERENCES work_orders(id) ON DELETE RESTRICT,
    module_hash TEXT NOT NULL,
    entrypoint TEXT NOT NULL,
    requested_capabilities_json TEXT NOT NULL,
    limits_json TEXT NOT NULL,
    api_version TEXT NOT NULL,
    signature TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('authored', 'validated', 'runnable', 'executing', 'executed', 'audited', 'revoked', 'purged')) DEFAULT 'authored',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
