//! Admitter (T8.2)
//!
//! Ref: IMPLEMENTATION_PLAN.md T8.2

pub fn admit_ready_missions(states: &[&str]) -> Vec<String> {
    states
        .iter()
        .filter(|s| **s == "READY" || **s == "RUNNING")
        .map(|s| s.to_string())
        .collect()
}
