use crate::domain::values::{Estimand, MissionId, TaskSignature};
use crate::ingest::read_model::OutcomeRecordRow;
use serde::{Deserialize, Serialize};
use ulid::Ulid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComputeSampleArgs {
    pub mission_id: MissionId,
    pub plan_version: u64,
    pub task_signature: TaskSignature,
    pub estimand: Estimand,
    pub p50: f64,
    pub p90: f64,
    pub actual: f64,
    pub concluded_at: u64,
}

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
            Estimand::Cost => 0.01,    // $0.01 floor
            Estimand::Duration => 1.0, // 1 second floor
            Estimand::Effort => 1.0,   // 1 unit floor
        }
    }

    pub fn compute(args: ComputeSampleArgs) -> Self {
        let floor = Self::get_floor(args.estimand);
        let denom = args.p50.max(floor);
        let signed_relative_error = (args.actual - args.p50) / denom;
        let abs_relative_error = signed_relative_error.abs();
        let within_band =
            args.actual <= args.p90 && args.actual >= (args.p50 - (args.p90 - args.p50));

        Self {
            sample_id: format!("smpl_{}", Ulid::new()),
            mission_id: args.mission_id,
            plan_version: args.plan_version,
            task_signature: args.task_signature,
            estimand: args.estimand,
            p50: args.p50,
            p90: args.p90,
            actual: args.actual,
            signed_relative_error,
            abs_relative_error,
            within_band,
            concluded_at: args.concluded_at,
        }
    }

    pub fn from_outcome(row: &OutcomeRecordRow) -> Vec<Self> {
        vec![
            Self::compute(ComputeSampleArgs {
                mission_id: row.mission_id.clone(),
                plan_version: row.plan_version,
                task_signature: row.task_signature.clone(),
                estimand: Estimand::Cost,
                p50: row.estimated_cost_p50,
                p90: row.estimated_cost_p90,
                actual: row.actual_cost,
                concluded_at: row.concluded_at,
            }),
            Self::compute(ComputeSampleArgs {
                mission_id: row.mission_id.clone(),
                plan_version: row.plan_version,
                task_signature: row.task_signature.clone(),
                estimand: Estimand::Duration,
                p50: row.estimated_duration_p50,
                p90: row.estimated_duration_p90,
                actual: row.actual_duration,
                concluded_at: row.concluded_at,
            }),
            Self::compute(ComputeSampleArgs {
                mission_id: row.mission_id.clone(),
                plan_version: row.plan_version,
                task_signature: row.task_signature.clone(),
                estimand: Estimand::Effort,
                p50: row.estimated_effort_p50,
                p90: row.estimated_effort_p90,
                actual: row.actual_effort,
                concluded_at: row.concluded_at,
            }),
        ]
    }
}
