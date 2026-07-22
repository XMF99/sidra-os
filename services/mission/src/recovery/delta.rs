//! Delta Authoriser (T10.6)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §14.4, IMPLEMENTATION_PLAN.md T10.6

pub fn classify_replan_delta(cost_increased: bool, objective_added: bool) -> &'static str {
    if cost_increased || objective_added {
        "requires_principal_approval"
    } else {
        "notify_only"
    }
}
