use crate::domain::health::AbsorbableVerdict;
use crate::domain::values::{DepartmentId, EvidenceRef};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AbsorbabilityResult {
    pub candidate_absorber: Option<DepartmentId>,
    pub projected_quality: f64,
    pub quality_drop: f64,
    pub verdict: AbsorbableVerdict,
    pub evidence: Vec<EvidenceRef>,
}
