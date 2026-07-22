use crate::domain::values::{DepartmentId, Quarter, ReviewId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SelfReviewEvent {
    StructureReviewScheduled {
        review_id: ReviewId,
        quarter: Quarter,
        actor: String,
    },
    StructureReviewStarted {
        review_id: ReviewId,
        quarter: Quarter,
    },
    DepartmentHealthAssessed {
        review_id: ReviewId,
        department_id: DepartmentId,
        earned_overhead: bool,
    },
    AbsorbabilityTested {
        review_id: ReviewId,
        department_id: DepartmentId,
        verdict: String,
    },
    StructureProposalRaised {
        proposal_id: String,
        review_id: ReviewId,
        department_id: DepartmentId,
        kind: String,
    },
    StructureReviewConcluded {
        review_id: ReviewId,
        quarter: Quarter,
        proposals_raised: usize,
    },
    StructureProposalLinkedToDecision {
        proposal_id: String,
        decision_id: String,
    },
    StructureProposalDeclined {
        proposal_id: String,
    },
}
