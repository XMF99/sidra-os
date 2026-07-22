use crate::domain::signature::ProcedureSignature;
use crate::domain::values::SignatureHash;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CandidateStatus {
    Proposed,
    Activated,
    Rejected,
    Superseded,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowCandidate {
    pub candidate_id: String,
    pub playbook_id: String,
    pub signature_hash: SignatureHash,
    pub signature: ProcedureSignature,
    pub capability_ceiling: Vec<String>,
    pub derived_from: Vec<String>, // Mandatory citation: >= 5 engagement IDs
    pub cited_missions: Vec<String>, // Mandatory citation: >= 5 distinct Mission IDs
    pub status: CandidateStatus,
    pub proposed_at: u64,
}

impl WorkflowCandidate {
    pub fn new(
        candidate_id: String,
        playbook_id: String,
        signature: ProcedureSignature,
        capability_ceiling: Vec<String>,
        derived_from: Vec<String>,
        cited_missions: Vec<String>,
        proposed_at: u64,
    ) -> Result<Self, String> {
        if cited_missions.len() < 5 || derived_from.len() < 5 {
            return Err(format!(
                "WorkflowCandidate citation invariant violated: expected >= 5 distinct Missions/Engagements, got missions: {}, engagements: {}",
                cited_missions.len(),
                derived_from.len()
            ));
        }

        let signature_hash = signature.hash.clone();

        Ok(Self {
            candidate_id,
            playbook_id,
            signature_hash,
            signature,
            capability_ceiling,
            derived_from,
            cited_missions,
            status: CandidateStatus::Proposed,
            proposed_at,
        })
    }
}
