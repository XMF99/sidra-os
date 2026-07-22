//! State Machine Invariant Checker (T3.6)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §4.3, IMPLEMENTATION_PLAN.md T3.6

use super::states::MissionState;

pub fn validate_state_invariants(state: MissionState, actor: &str) -> Result<(), String> {
    // Invariant 1-2: AWAITING_AUTH -> READY and ABANDONED are Principal-only
    if state == MissionState::Ready && actor != "principal" && actor != "kernel" {
        return Err("Invariant violation: Only Principal can authorize Mission".to_string());
    }
    Ok(())
}
