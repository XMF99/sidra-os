use crate::domain::values::{Confidence, DepartmentId, EvidenceRef, OverheadScore, QualityScore, ReviewId};
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

impl DepartmentHealth {
    pub fn new(
        health_id: String,
        review_id: ReviewId,
        department_id: DepartmentId,
        overhead: OverheadScore,
        measured_quality: QualityScore,
        earned_overhead: bool,
        absorbable_verdict: AbsorbableVerdict,
        candidate_absorber: Option<DepartmentId>,
        quality_drop: f64,
        evidence: Vec<EvidenceRef>,
        confidence: Confidence,
        assessed_at: u64,
    ) -> Result<Self, String> {
        if evidence.is_empty() {
            return Err(format!(
                "DepartmentHealth invariant violated: evidence set for department {} cannot be empty (ADR-0077)",
                department_id.0
            ));
        }

        Ok(Self {
            health_id,
            review_id,
            department_id,
            overhead,
            measured_quality,
            earned_overhead,
            absorbable_verdict,
            candidate_absorber,
            quality_drop,
            evidence,
            confidence,
            assessed_at,
        })
    }
}
