//! Estimate Collector (T5.5)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §23.5 rule 3, IMPLEMENTATION_PLAN.md T5.5

use crate::domain::task::TaskEstimate;
use crate::domain::values::{Duration, Money};

pub fn collect_estimate(_contract_ref: &str) -> TaskEstimate {
    TaskEstimate {
        estimated_cost: Money(15.0),
        estimated_duration: Duration(300),
        source: "department".to_string(),
    }
}
