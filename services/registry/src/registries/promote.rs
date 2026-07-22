//! Canon Promotion Candidate Flow (ADR-0017)
//!
//! Ref: IMPLEMENTATION_PLAN.md T7.4

use crate::domain::registries::RegistryEntry;

#[derive(Debug, Clone)]
pub struct CanonCandidateProposal {
    pub entry_id: String,
    pub proposed_by: String,
    pub confirmed_by_principal: bool,
}

pub fn propose_canon_candidate(entry: &RegistryEntry, proposed_by: &str) -> CanonCandidateProposal {
    CanonCandidateProposal {
        entry_id: entry.entry_id.clone(),
        proposed_by: proposed_by.to_string(),
        confirmed_by_principal: false,
    }
}
