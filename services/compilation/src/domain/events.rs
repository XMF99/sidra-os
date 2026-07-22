use crate::domain::values::SignatureHash;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CompilationEvent {
    ProcedureObserved {
        signature_hash: SignatureHash,
        mission_id: String,
        actor: String,
    },
    RecurrenceThresholdReached {
        signature_hash: SignatureHash,
        distinct_count: usize,
    },
    WorkflowCandidateProposed {
        candidate_id: String,
        playbook_id: String,
        signature_hash: SignatureHash,
        cited_count: usize,
    },
    CandidateWideningRefused {
        candidate_id: String,
        reason: String,
    },
    CandidateActivated {
        candidate_id: String,
        decision_id: String,
        playbook_id: String,
        actor: String,
    },
    CandidateRejected {
        candidate_id: String,
        decision_id: String,
        actor: String,
    },
    CandidateSuperseded {
        superseded_candidate_id: String,
        new_candidate_id: String,
    },
}
