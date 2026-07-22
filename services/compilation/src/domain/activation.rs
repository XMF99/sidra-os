use crate::domain::candidate::CandidateStatus;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CandidateActivation {
    pub activation_id: String,
    pub candidate_id: String,
    pub decision_id: String, // DecisionId required (ADR-0074)
    pub activated_playbook_id: String,
    pub resolution: CandidateStatus,
    pub actor: String,
    pub resolved_at: u64,
}

impl CandidateActivation {
    pub fn new(
        activation_id: String,
        candidate_id: String,
        decision_id: String,
        activated_playbook_id: String,
        resolution: CandidateStatus,
        actor: String,
        resolved_at: u64,
    ) -> Result<Self, String> {
        if decision_id.trim().is_empty() {
            return Err("CandidateActivation requires a valid non-empty DecisionId".to_string());
        }
        Ok(Self {
            activation_id,
            candidate_id,
            decision_id,
            activated_playbook_id,
            resolution,
            actor,
            resolved_at,
        })
    }
}
