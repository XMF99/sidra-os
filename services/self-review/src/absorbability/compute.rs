use crate::domain::absorbability::AbsorbabilityResult;
use crate::domain::health::AbsorbableVerdict;
use crate::domain::values::{DepartmentId, EvidenceRef, QualityScore};

pub struct AbsorbabilityCalculator;

impl AbsorbabilityCalculator {
    pub const CONFIDENCE_FLOOR: f64 = 0.60;

    pub fn assess(
        _department_id: &DepartmentId,
        dept_quality: QualityScore,
        neighbours: &[(DepartmentId, QualityScore)],
        evidence: Vec<EvidenceRef>,
        confidence_val: f64,
    ) -> AbsorbabilityResult {
        if neighbours.is_empty() {
            return AbsorbabilityResult {
                candidate_absorber: None,
                projected_quality: 0.0,
                quality_drop: 0.0,
                verdict: AbsorbableVerdict::NotAbsorbable,
                evidence,
            };
        }

        if confidence_val < Self::CONFIDENCE_FLOOR {
            return AbsorbabilityResult {
                candidate_absorber: None,
                projected_quality: 0.0,
                quality_drop: 0.0,
                verdict: AbsorbableVerdict::InsufficientEvidence,
                evidence,
            };
        }

        let mut best_neighbour: Option<&(DepartmentId, QualityScore)> = None;
        for n in neighbours {
            if let Some(best) = best_neighbour {
                if n.1 .0 > best.1 .0 {
                    best_neighbour = Some(n);
                }
            } else {
                best_neighbour = Some(n);
            }
        }

        if let Some((absorber_id, absorber_quality)) = best_neighbour {
            let quality_drop = dept_quality.0 - absorber_quality.0;
            let verdict = if quality_drop <= 0.0 {
                AbsorbableVerdict::Absorbable
            } else {
                AbsorbableVerdict::NotAbsorbable
            };

            AbsorbabilityResult {
                candidate_absorber: Some(absorber_id.clone()),
                projected_quality: absorber_quality.0,
                quality_drop,
                verdict,
                evidence,
            }
        } else {
            AbsorbabilityResult {
                candidate_absorber: None,
                projected_quality: 0.0,
                quality_drop: 0.0,
                verdict: AbsorbableVerdict::NotAbsorbable,
                evidence,
            }
        }
    }
}
