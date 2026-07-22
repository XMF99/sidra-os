-- Migration 0062: Evaluation Sets Table for M27 Charter Evolution
-- Stores versioned evaluation sets bound one-to-one to Role Archetypes.

CREATE TABLE IF NOT EXISTS evaluation_sets (
    eval_set_id TEXT PRIMARY KEY NOT NULL,
    archetype_id TEXT NOT NULL,
    eval_set_version INTEGER NOT NULL,
    cases_json TEXT NOT NULL,
    scoring_spec_json TEXT NOT NULL,
    registered_at INTEGER NOT NULL,
    registered_by TEXT NOT NULL,
    UNIQUE(archetype_id, eval_set_version)
);

CREATE INDEX IF NOT EXISTS idx_evaluation_sets_archetype_ver ON evaluation_sets(archetype_id, eval_set_version DESC);
