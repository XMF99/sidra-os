//! P0 Cap of Two Enforcement (T8.9)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §9.2, IMPLEMENTATION_PLAN.md T8.9

pub fn check_p0_cap(active_p0_count: usize) -> Result<(), String> {
    if active_p0_count >= 2 {
        return Err("Refusal: Maximum of 2 concurrent P0 missions reached. Requires explicit demotion to add another.".to_string());
    }
    Ok(())
}
