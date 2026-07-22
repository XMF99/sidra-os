-- M20 Executable Artifacts: 0041_artifact_runs.sql
-- Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §11.1, ADR-0054

CREATE TABLE IF NOT EXISTS artifact_runs (
    id TEXT PRIMARY KEY NOT NULL,
    artifact_id TEXT NOT NULL REFERENCES executable_artifacts(artifact_id),
    invoked_by TEXT NOT NULL,
    invoking_work_order TEXT NOT NULL,
    effective_grant_json TEXT NOT NULL,
    fuel_used INTEGER NOT NULL,
    wall_ms INTEGER NOT NULL,
    outcome TEXT NOT NULL,
    effects_json TEXT NOT NULL,
    at INTEGER NOT NULL DEFAULT (unixepoch())
);
