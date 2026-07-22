use crate::domain::values::{Estimand, MissionId, TaskSignature};
use crate::ingest::read_model::OutcomeRecordRow;
use serde::{Deserialize, Serialize};
use ulid::Ulid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EstimateErrorSample {
    pub sample_id: String,
    pub mission_id: MissionId,
    pub plan_version: u64,
    pub task_signature: TaskSignature,
    pub estimand: Estimand,
    pub p50: f64,
    pub p90: f64,
    pub actual: f64,
    pub signed_relative_error: f64,
    pub abs_relative_error: f64,
    pub within_band: bool,
    pub concluded_at: u64,
}

impl EstimateErrorSample {
    pub fn get_floor(estimand: Estimand) -> f64 {
        match estimand {
            Estimand::Cost => 0.01,     // $0.01 floor
            Estimand::Duration => 1.0,  // 1 second floor
            Estimand::Effort => 1.0,    // 1 unit floor
        }
    }

    pub fn compute(
        mission_id: MissionId,
        plan_version: u64,
        task_signature: TaskSignature,
        estimand: Estimand,
        p50: f64,
        p90: f64,
        actual: f64,
        concluded_at: u64,
    ) -> Self {
        let floor = Self::get_floor(estimand);
        let denom = p50.max(floor);
        let signed_relative_error = (actual - p50) / denom;
        let abs_relative_error = signed_relative_error.abs();
        let within_band = actual <= p90 && actual >= (p50 - (p90 - p50));

        Self {
            sample_id: format!("smpl_{}", Ulid::new()),
            mission_id,
            plan_version,
            task_signature,
            estimand,
            p50,
            p90,
            actual,
            signed_relative_error,
            abs_relative_error,
            within_band,
            concluded_at,
        }
    }

    pub fn from_outcome(row: &OutcomeRecordRow) -> Vec<Self> {
        let mut samples = Vec::new();

        // Cost sample
        samples.push(Self::compute(
            row.mission_id.clone(),
            row.plan_version,
            row.task_signature.clone(),
            Estimand::Cost,
            row.estimated_cost_p50,
            row.estimated_cost_p90,
            row.actual_cost,
            row.concluded_at,
        ));

        // Duration sample
        samples.push(Self::compute(
            row.mission_id.clone(),
            row.plan_version,
            row.task_signature.clone(),
            Estimand::Duration,
            row.estimated_duration_p50,
            row.estimated_duration_p90,
            row.actual_duration,
            row.concluded_at,
        ));

        // Effort sample
        samples.push(Self::compute(
            row.mission_id.clone(),
            row.plan_version,
            row.task_signature.clone(),
            Estimand::Effort,
            row.estimated_effort_p50,
            row.estimated_effort_p90,
            row.actual_effort,
            row.concluded_at,
        ));

        samples
    }
}
