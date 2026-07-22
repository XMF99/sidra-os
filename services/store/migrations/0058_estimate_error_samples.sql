-- Migration 0058: Estimate Error Samples Table for M26 Outcome Calibration
-- Materialised samples from concluded Mission outcome records (read-only input).

CREATE TABLE IF NOT EXISTS estimate_error_samples (
    sample_id TEXT PRIMARY KEY NOT NULL,
    mission_id TEXT NOT NULL,
    plan_version INTEGER NOT NULL,
    task_signature TEXT NOT NULL,
    estimand TEXT NOT NULL, -- cost, duration, effort
    p50 REAL NOT NULL,
    p90 REAL NOT NULL,
    actual REAL NOT NULL,
    signed_relative_error REAL NOT NULL,
    abs_relative_error REAL NOT NULL,
    within_band BOOLEAN NOT NULL,
    concluded_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_estimate_error_samples_sig ON estimate_error_samples(task_signature, estimand);
CREATE INDEX IF NOT EXISTS idx_estimate_error_samples_concluded ON estimate_error_samples(concluded_at);
