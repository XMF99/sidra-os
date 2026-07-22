//! DepartmentRequest Type (F-comm)
//!
//! Ref: ADR-0013, DEPARTMENT_SUBSTRATE_ARCHITECTURE.md §8

use crate::domain::{CapabilityCeiling, ContractName, DepartmentId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DepartmentRequest {
    pub from_department: DepartmentId,
    pub to_contract: ContractName, // Refers to a contract, NEVER a DepartmentId
    pub requester_budget_attribution: f64,
    pub effect_ceiling: CapabilityCeiling,
    pub payload: String,
}
