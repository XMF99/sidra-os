//! Drop Condition Filter (T8.3, T8.4)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §17.2 step 3, IMPLEMENTATION_PLAN.md T8.3, T8.4

pub fn filter_candidate(budget_available: bool, severe_approved: bool, risk_band: &str) -> bool {
    if !budget_available {
        return false; // Unaffordable task dropped before ordering
    }
    if risk_band == "Severe" && !severe_approved {
        return false; // Severe band without approval dropped
    }
    true
}
