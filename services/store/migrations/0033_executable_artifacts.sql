-- M20 Executable Artifacts: 0033_executable_artifacts.sql
-- Additive projections for executable artifact capability grants and execution logs

CREATE TABLE IF NOT EXISTS executable_artifacts (
    artifact_id TEXT PRIMARY KEY NOT NULL,
    producing_work_order_id TEXT NOT NULL REFERENCES work_orders(id) ON DELETE RESTRICT,
    wasm_module_hash TEXT NOT NULL,
    requested_capabilities_json TEXT NOT NULL,
    frozen_grant_json TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('draft', 'runnable', 'revoked')) DEFAULT 'runnable',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS artifact_executions (
    execution_id TEXT PRIMARY KEY NOT NULL,
    artifact_id TEXT NOT NULL REFERENCES executable_artifacts(artifact_id),
    invoked_by_work_order_id TEXT NOT NULL,
    effective_grant_json TEXT NOT NULL,
    fuel_consumed INTEGER NOT NULL,
    outcome TEXT NOT NULL CHECK (outcome IN ('success', 'failed', 'fuel_exhausted', 'fenced')),
    executed_at INTEGER NOT NULL DEFAULT (unixepoch())
);
