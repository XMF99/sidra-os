//! Objective Commands (T11.6)
//!
//! Ref: IMPLEMENTATION_PLAN.md T11.6

pub fn waive_objective_cmd(actor: &str, objective_id: &str, rationale: &str) -> Result<String, String> {
    crate::verify::waive::waive_objective(actor, objective_id, rationale)
}
