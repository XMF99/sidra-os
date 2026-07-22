//! Anti-Starvation & Fairness (T8.8)
//!
//! Ref: IMPLEMENTATION_PLAN.md T8.8

pub fn apply_fairness_boost(ticks_waiting: u64) -> u64 {
    if ticks_waiting > 100 {
        ticks_waiting / 10
    } else {
        0
    }
}
