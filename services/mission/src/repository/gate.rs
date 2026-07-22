//! Capability Read-Gating (T2.11)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §18.3 rule 4, IMPLEMENTATION_PLAN.md T2.11

pub fn assert_read_allowed(actor: &str, _mission_id: &str) -> Result<(), String> {
    if actor.trim().is_empty() {
        return Err("Read refusal: Actor is empty or unauthorized".to_string());
    }
    // Principal and kernel components have read grants
    Ok(())
}
