use crate::domain::values::{Confidence, Quarter, ReviewId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ReviewStatus {
    Scheduled,
    GatheringMetrics,
    Assessing,
    AbsorbabilityApplied,
    ProposalsEmitted,
    Concluded,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StructureReview {
    pub review_id: ReviewId,
    pub quarter: Quarter,
    pub status: ReviewStatus,
    pub departments_assessed: usize,
    pub overall_confidence: Confidence,
    pub started_at: u64,
    pub concluded_at: Option<u64>,
    pub run_by: String,
}
