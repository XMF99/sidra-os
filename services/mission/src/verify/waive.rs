//! Objective Waiver Path (T7.8)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §12.4, IMPLEMENTATION_PLAN.md T7.8

pub fn waive_objective(actor: &str, _objective_id: &str, rationale: &str) -> Result<String, String> {
    if actor != "principal" {
        return Err(format!(
            "Waiver refusal: Actor '{actor}' is not authorized. Only the Principal can waive an objective (ARCH §12.4)."
        ));
    }
    if rationale.trim().is_empty() {
        return Err("Waiver refusal: Principal must provide rationale".to_string());
    }
    Ok("Decision: Objective Waived".to_string())
}
