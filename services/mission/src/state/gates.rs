//! Phase Gate Evaluators (T3.5)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §3.3, IMPLEMENTATION_PLAN.md T3.5

use crate::domain::mission::Mission;

pub fn evaluate_phase_gate(mission: &Mission, target_phase: &str) -> Result<(), Vec<String>> {
    let mut errors = Vec::new();

    match target_phase {
        "PLANNING" => {
            if mission.charter.budget().minor_units() <= 0 {
                errors.push("PLANNING gate failed: Charter budget must be > 0".to_string());
            }
        }
        "AWAITING_AUTH" => {
            if mission.current_plan().is_none() {
                errors.push("AWAITING_AUTH gate failed: No authorized plan version present".to_string());
            }
        }
        "READY" => {
            if mission.current_state != "AWAITING_AUTH" {
                errors.push("READY gate failed: Mission must be in AWAITING_AUTH state".to_string());
            }
        }
        _ => {}
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}
