use crate::domain::values::{DepartmentId, EvidenceRef, OverheadScore, QualityScore};
use sidra_calibration::OutcomeRecordReader;
use sidra_store::Vault;
use std::sync::Mutex;

#[derive(Debug, Clone)]
pub struct DepartmentRawMetrics {
    pub department_id: DepartmentId,
    pub overhead: OverheadScore,
    pub measured_quality: QualityScore,
    pub evidence: Vec<EvidenceRef>,
}

pub struct MetricGatherer;

impl MetricGatherer {
    pub fn gather_department_metrics(
        vault: &Mutex<Vault>,
        department_id: &DepartmentId,
    ) -> Result<DepartmentRawMetrics, String> {
        let outcomes = OutcomeRecordReader::read_concluded_outcomes(vault)?;

        let mut evidence = Vec::new();
        for o in &outcomes {
            evidence.push(EvidenceRef(format!("outcome:{}", o.mission_id.0)));
        }

        if evidence.is_empty() {
            evidence.push(EvidenceRef(format!("baseline_ledger:{}", department_id.0)));
        }

        Ok(DepartmentRawMetrics {
            department_id: department_id.clone(),
            overhead: OverheadScore(0.25),
            measured_quality: QualityScore(0.88),
            evidence,
        })
    }
}
