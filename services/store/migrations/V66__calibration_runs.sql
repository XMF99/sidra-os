-- Migration 0059: Calibration Runs & Adjustments Tables for M26 Outcome Calibration
-- Stores provenance of calibration runs and exact adjustment sample attribution.

CREATE TABLE IF NOT EXISTS calibration_runs (
    run_id TEXT PRIMARY KEY NOT NULL,
    from_version INTEGER NOT NULL,
    to_version INTEGER,
    outcome TEXT NOT NULL, -- APPLIED, REJECTED, INSUFFICIENT
    metric_before_ee REAL NOT NULL,
    metric_after_ee REAL NOT NULL,
    run_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS calibration_adjustments (
    adjustment_id TEXT PRIMARY KEY NOT NULL,
    run_id TEXT NOT NULL REFERENCES calibration_runs(run_id),
    target_type TEXT NOT NULL, -- estimate_correction, novelty_mapping, risk_weight
    target_key TEXT NOT NULL,
    old_value REAL NOT NULL,
    new_value REAL NOT NULL,
    sample_count INTEGER NOT NULL,
    sample_ids_json TEXT NOT NULL,
    clamped BOOLEAN NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_calibration_adjustments_run ON calibration_adjustments(run_id);
