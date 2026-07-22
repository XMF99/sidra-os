//! Manifest Compile-Time Rule (F-comm)
//!
//! Ref: ADR-0013, DEPARTMENT_SUBSTRATE_ARCHITECTURE.md §8, Failure F6

pub fn validate_manifest_contracts(requires_contracts: &[String]) -> Result<(), String> {
    for c in requires_contracts {
        if c.starts_with("dept:") || c.starts_with("department:") {
            return Err(format!(
                "Manifest refusal: contract requirement '{c}' names a department instead of a contract"
            ));
        }
    }
    Ok(())
}
