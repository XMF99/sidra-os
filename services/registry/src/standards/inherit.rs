//! Standards Inheritance Resolution (Firm > Application > Department)
//!
//! Ref: ADR-0016, IMPLEMENTATION_PLAN.md T5.2

use crate::domain::standards::Standard;

pub fn resolve_inheritance(
    firm_standards: &[Standard],
    app_standards: &[Standard],
    dept_standards: &[Standard],
) -> Vec<Standard> {
    let mut resolved = Vec::new();
    resolved.extend_from_slice(firm_standards);
    resolved.extend_from_slice(app_standards);
    resolved.extend_from_slice(dept_standards);
    resolved
}

pub fn validate_no_relaxation(
    parent_standard: &Standard,
    child_standard: &Standard,
) -> Result<(), String> {
    // A department standard may tighten but NEVER relax an inherited standard
    if parent_standard.standard_id == child_standard.standard_id
        && parent_standard.guard_id != child_standard.guard_id
    {
        return Err(format!(
            "Standards relaxation refusal: Child standard '{}' relaxes parent standard guard",
            child_standard.standard_id
        ));
    }
    Ok(())
}
