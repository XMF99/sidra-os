-- Migration 0066: Candidate Activations Table for M28 Procedural Compilation
-- Stores activation and rejection records tied to Principal Decisions.
-- decision_id NOT NULL guarantees no activation can exist without a Decision ID (ADR-0074).

CREATE TABLE IF NOT EXISTS candidate_activations (
    activation_id TEXT PRIMARY KEY NOT NULL,
    candidate_id TEXT NOT NULL REFERENCES workflow_candidates(candidate_id),
    decision_id TEXT NOT NULL, -- NOT NULL constraint enforced
    activated_playbook_id TEXT NOT NULL,
    resolution TEXT NOT NULL, -- ACTIVATED, REJECTED, SUPERSEDED
    actor TEXT NOT NULL,
    resolved_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_candidate_activations_cand ON candidate_activations(candidate_id);
