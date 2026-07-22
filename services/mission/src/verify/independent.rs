//! Independent Agent Check with Department Separation (T7.6)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §12.3 rule 3, IMPLEMENTATION_PLAN.md T7.6

pub fn select_independent_verifier(author_dept: &str, candidate_dept: &str) -> Result<(), String> {
    if author_dept == candidate_dept {
        return Err(format!(
            "Verifier selection refusal: Verifier department '{}' matches author department. Independent verifier must come from a different department (ARCH §12.3 rule 3).",
            candidate_dept
        ));
    }
    Ok(())
}
