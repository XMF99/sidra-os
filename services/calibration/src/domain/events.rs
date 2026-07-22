use crate::domain::values::{Estimand, ParameterVersion, TaskSignature};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CalibrationEvent {
    EstimateErrorSampled {
        mission_id: String,
        plan_version: u64,
        estimand: Estimand,
        task_signature: TaskSignature,
        p50: f64,
        p90: f64,
        actual: f64,
        signed_error: f64,
        abs_error: f64,
        within_band: bool,
    },
    CalibrationRunStarted {
        run_id: String,
        from_version: ParameterVersion,
        sample_count: usize,
    },
    CalibrationApplied {
        run_id: String,
        new_version: ParameterVersion,
        ee_before: f64,
        ee_after: f64,
    },
    CalibrationRejected {
        run_id: String,
        reason: String,
        ee_before: f64,
        ee_candidate: f64,
    },
    CalibrationReverted {
        reverted_from_version: ParameterVersion,
        reactivated_version: ParameterVersion,
    },
}
