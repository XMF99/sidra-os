//! Replanner & Replan Max Bounding (T10.4, T10.5)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §14.3, IMPLEMENTATION_PLAN.md T10.4, T10.5, ADR-0029

pub fn check_replan_max(current_replan_count: u32, max_replan_count: u32) -> Result<(), String> {
    if current_replan_count >= max_replan_count {
        return Err(format!(
            "Replan refusal: Replan count ({current_replan_count}) reached maximum limit ({max_replan_count}). Concluding as partially_completed (ARCH §14.3)."
        ));
    }
    Ok(())
}
