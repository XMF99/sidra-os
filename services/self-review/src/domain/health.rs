use crate::domain::values::{
    Confidence, DepartmentId, EvidenceRef, OverheadScore, QualityScore, ReviewId,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum AbsorbableVerdict {
    Absorbable,
    NotAbsorbable,
    InsufficientEvidence,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DepartmentHealth {
    pub health_id: String,
    pub review_id: ReviewId,
    pub department_id: DepartmentId,
    pub overhead: OverheadScore,
    pub measured_quality: QualityScore,
    pub earned_overhead: bool,
    pub absorbable_verdict: AbsorbableVerdict,
    pub candidate_absorber: Option<DepartmentId>,
    pub quality_drop: f64,
    pub evidence: Vec<EvidenceRef>, // Required non-empty (ADR-0077)
    pub confidence: Confidence,
    pub assessed_at: u64,
}

pub struct DepartmentHealthParams {
    pub health_id: String,
    pub review_id: ReviewId,
    pub department_id: DepartmentId,
    pub overhead: OverheadScore,
    pub measured_quality: QualityScore,
    pub earned_overhead: bool,
    pub absorbable_verdict: AbsorbableVerdict,
    pub candidate_absorber: Option<DepartmentId>,
    pub quality_drop: f64,
    pub evidence: Vec<EvidenceRef>,
    pub confidence: Confidence,
    pub assessed_at: u64,
}

impl DepartmentHealth {
    pub fn new(params: DepartmentHealthParams) -> Result<Self, String> {
        if params.evidence.is_empty() {
            return Err(format!(
                "DepartmentHealth invariant violated: evidence set for department {} cannot be empty (ADR-0077)",
                params.department_id.0
            ));
        }

        Ok(Self {
            health_id: params.health_id,
            review_id: params.review_id,
            department_id: params.department_id,
            overhead: params.overhead,
            measured_quality: params.measured_quality,
            earned_overhead: params.earned_overhead,
            absorbable_verdict: params.absorbable_verdict,
            candidate_absorber: params.candidate_absorber,
            quality_drop: params.quality_drop,
            evidence: params.evidence,
            confidence: params.confidence,
            assessed_at: params.assessed_at,
        })
    }
}
