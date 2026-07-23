//! Orchestrator Move-After-Review Path (F-fs)
//!
//! Ref: DEPARTMENT_SUBSTRATE_ARCHITECTURE.md §7.2, IMPLEMENTATION_PLAN.md T4.2

pub fn relocate_deliverable_after_review(
    source_path: &str,
    target_path: &str,
    is_reviewed: bool,
) -> Result<String, &'static str> {
    if !is_reviewed {
        return Err(
            "Deliverable must be accepted in review before relocation across department boundary",
        );
    }
    Ok(format!(
        "Relocating reviewed deliverable from '{source_path}' to '{target_path}'"
    ))
}
