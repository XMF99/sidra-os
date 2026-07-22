use crate::domain::values::{Confidence, DecisionId, DepartmentId, EvidenceRef, ReviewId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ProposalKind {
    Merge { into: DepartmentId },
    Retire,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ProposalResolution {
    Open,
    EnactedByPrincipal,
    Declined,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StructureProposal {
    pub proposal_id: String,
    pub review_id: ReviewId,
    pub department_id: DepartmentId,
    pub kind: ProposalKind,
    pub rationale: String,
    pub evidence: Vec<EvidenceRef>,
    pub confidence: Confidence,
    pub resolution: ProposalResolution,
    pub decision_id: Option<DecisionId>,
    pub proposed_at: u64,
}

impl StructureProposal {
    pub fn new(
        proposal_id: String,
        review_id: ReviewId,
        department_id: DepartmentId,
        kind: ProposalKind,
        rationale: String,
        evidence: Vec<EvidenceRef>,
        confidence: Confidence,
        proposed_at: u64,
    ) -> Result<Self, String> {
        if evidence.is_empty() {
            return Err(format!(
                "StructureProposal invariant violated: evidence set for proposal {} cannot be empty (ADR-0077)",
                proposal_id
            ));
        }

        Ok(Self {
            proposal_id,
            review_id,
            department_id,
            kind,
            rationale,
            evidence,
            confidence,
            resolution: ProposalResolution::Open,
            decision_id: None,
            proposed_at,
        })
    }
}
