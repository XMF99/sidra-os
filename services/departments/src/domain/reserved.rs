//! Reserved ID Guard
//!
//! Ref: DEPARTMENT_SUBSTRATE_ARCHITECTURE.md §4.2, Failure F5

use super::values::DepartmentId;

pub fn validate_pack_department_id(id: &DepartmentId) -> Result<(), &'static str> {
    if id.is_default() {
        return Err("Reserved id '__default__' cannot be used by a Department Pack");
    }
    Ok(())
}
