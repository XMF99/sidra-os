//! Planning Cost Accounting & G9 Metric (T5.8)
//!
//! Ref: IMPLEMENTATION_PLAN.md T5.8, G9 Metric (median <= 8%, p95 <= 15%)

pub fn calculate_g9_ratio(planning_cost: f64, mission_cost: f64) -> f64 {
    if mission_cost <= 0.0 {
        return 0.0;
    }
    planning_cost / mission_cost
}
