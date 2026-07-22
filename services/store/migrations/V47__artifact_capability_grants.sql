-- M20 Executable Artifacts: 0040_artifact_capability_grants.sql
-- Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §11.1, ADR-0054, ADR-0056

CREATE TABLE IF NOT EXISTS artifact_capability_grants (
    artifact_id TEXT PRIMARY KEY NOT NULL REFERENCES executable_artifacts(artifact_id),
    derived_from_work_order TEXT NOT NULL REFERENCES work_orders(id) ON DELETE RESTRICT,
    frozen_grant_json TEXT NOT NULL,
    computed_at INTEGER NOT NULL,
    computed_by TEXT NOT NULL,
    revoked_at INTEGER
);
