-- Migration 0065: Workflow Candidates Table for M28 Procedural Compilation
-- Stores provenance projection linked to playbooks.id for compiled proposed workflows.

CREATE TABLE IF NOT EXISTS workflow_candidates (
    candidate_id TEXT PRIMARY KEY NOT NULL,
    playbook_id TEXT NOT NULL,
    signature_hash TEXT NOT NULL,
    normalized_steps_json TEXT NOT NULL,
    capability_ceiling_json TEXT NOT NULL,
    cited_missions_json TEXT NOT NULL, -- JSON array of >= 5 distinct Mission IDs
    status TEXT NOT NULL, -- PROPOSED, ACTIVATED, REJECTED, SUPERSEDED
    proposed_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_workflow_candidates_sig ON workflow_candidates(signature_hash);
CREATE INDEX IF NOT EXISTS idx_workflow_candidates_status ON workflow_candidates(status);
