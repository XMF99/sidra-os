//! Department Pause on Sub-Ceiling Exhaustion (F-bud)
//!
//! Ref: ADR-0020, IMPLEMENTATION_PLAN.md T3.3

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DepartmentApprovalRequest {
    pub department_id: String,
    pub spent: f64,
    pub ceiling: f64,
    pub reason: String,
}

pub fn handle_department_exhaustion(
    department_id: &str,
    spent: f64,
    ceiling: f64,
) -> DepartmentApprovalRequest {
    DepartmentApprovalRequest {
        department_id: department_id.to_string(),
        spent,
        ceiling,
        reason: format!(
            "Department '{department_id}' budget sub-ceiling exhausted: spent {spent:.2} / ceiling {ceiling:.2}"
        ),
    }
}
