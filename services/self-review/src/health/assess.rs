use crate::absorbability::compute::AbsorbabilityCalculator;
use crate::domain::health::DepartmentHealth;
use crate::domain::values::{Confidence, DepartmentId, QualityScore, ReviewId};
use crate::metrics::gather::MetricGatherer;
use sidra_store::Vault;
use std::sync::Mutex;
use ulid::Ulid;

pub struct HealthAssessor;

impl HealthAssessor {
    pub fn assess_department(
        vault: &Mutex<Vault>,
        review_id: &ReviewId,
        department_id: &DepartmentId,
        division_neighbours: &[(DepartmentId, QualityScore)],
        timestamp: u64,
    ) -> Result<DepartmentHealth, String> {
        let metrics = MetricGatherer::gather_department_metrics(vault, department_id)?;
        let conf = Confidence::new(0.85).map_err(|e| e.to_string())?;

        let absorb_result = AbsorbabilityCalculator::assess(
            department_id,
            metrics.measured_quality,
            division_neighbours,
            metrics.evidence.clone(),
            conf.0,
        );

        let earned_overhead = metrics.overhead.0 <= metrics.measured_quality.0;

        DepartmentHealth::new(
            format!("hlth_{}", Ulid::new()),
            review_id.clone(),
            department_id.clone(),
            metrics.overhead,
            metrics.measured_quality,
            earned_overhead,
            absorb_result.verdict,
            absorb_result.candidate_absorber,
            absorb_result.quality_drop,
            metrics.evidence,
            conf,
            timestamp,
        )
    }
}
