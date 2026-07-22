//! Risk Recompute (T6.8)
//!
//! Ref: IMPLEMENTATION_PLAN.md T6.8

use super::aggregate::{aggregate_risk, RiskBand, RiskDimensions};

pub fn recompute_risk(dims: &RiskDimensions) -> (f64, RiskBand) {
    aggregate_risk(dims)
}
