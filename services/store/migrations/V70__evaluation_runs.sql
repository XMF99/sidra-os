-- Migration 0063: Evaluation Runs Table for M27 Charter Evolution
-- Stores inspectable evaluation runs pinned to evaluation_set_version.

CREATE TABLE IF NOT EXISTS evaluation_runs (
    run_id TEXT PRIMARY KEY NOT NULL,
    eval_set_id TEXT NOT NULL,
    eval_set_version INTEGER NOT NULL,
    subject_kind TEXT NOT NULL, -- BASELINE, CANDIDATE
    subject_ref TEXT NOT NULL,
    aggregate_score REAL NOT NULL,
    per_case_json TEXT NOT NULL,
    seed INTEGER NOT NULL,
    ran_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evaluation_runs_set_ver ON evaluation_runs(eval_set_id, eval_set_version);
