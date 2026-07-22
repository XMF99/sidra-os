//! Risk-Driven Checkpointer (T10.1)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §14.1, IMPLEMENTATION_PLAN.md T10.1

pub fn should_checkpoint(risk_band: &str, is_pre_effect: bool) -> bool {
    match risk_band {
        "Severe" => true, // Severe band checkpoints before every effect!
        "High" => is_pre_effect,
        "Moderate" => false, // Checkpoints on failure
        _ => false,
    }
}
