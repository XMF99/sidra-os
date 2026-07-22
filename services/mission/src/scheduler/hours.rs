//! Quiet Hours Gating (T8.10)
//!
//! Ref: IMPLEMENTATION_PLAN.md T8.10

pub fn is_within_working_hours(hour: u32) -> bool {
    (8..=18).contains(&hour)
}
