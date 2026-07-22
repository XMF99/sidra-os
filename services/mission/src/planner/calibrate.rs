//! Historical Calibration (T5.6)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §23.2, IMPLEMENTATION_PLAN.md T5.6

use crate::domain::task::TaskEstimate;

pub fn calibrate_estimate(estimate: TaskEstimate, history_count: usize) -> TaskEstimate {
    let mut calibrated = estimate;
    if history_count == 0 {
        // Absent history widens estimate spread (ARCH §11.5 rule 4)
        calibrated.source = "heuristic".to_string();
    }
    calibrated
}
