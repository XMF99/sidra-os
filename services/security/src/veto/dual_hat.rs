//! Dual-Hat Boundary Check (M12)
//!
//! Ref: STRUCTURE_ARCHITECTURE.md §3.3, IMPLEMENTATION_PLAN.md T3.5

pub fn validate_dual_hat_boundary(
    reviewer_division: &str,
    author_division: &str,
    reviewer_agent_id: &str,
) -> Result<(), String> {
    // Argus and Cass are exempt from home division restrictions
    if reviewer_agent_id == "argus" || reviewer_agent_id == "cass" {
        return Ok(());
    }

    if reviewer_division == author_division {
        return Err(format!(
            "Dual-hat refusal: Reviewer division '{reviewer_division}' equals author division '{author_division}'. An Office head cannot review their home division's artifacts."
        ));
    }

    Ok(())
}
