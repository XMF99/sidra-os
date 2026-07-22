//! Single Intake Path for Outcomes (T9.4)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §22.2, IMPLEMENTATION_PLAN.md T9.4
//! `task.record_outcome` is the ONLY write from Orchestrator into Mission state.

use super::outcome::OutcomeEnvelope;

pub fn record_outcome(envelope: &OutcomeEnvelope) -> Result<(), String> {
    if envelope.mission_id.trim().is_empty() || envelope.task_id.trim().is_empty() {
        return Err("Outcome intake failure: Invalid envelope identifiers".to_string());
    }
    Ok(())
}
