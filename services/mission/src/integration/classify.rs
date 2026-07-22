//! Failure Classifier (T9.5)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §13.2, IMPLEMENTATION_PLAN.md T9.5
//! 8 Error Classes from structured error.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FailureClass {
    Transient,
    Deterministic,
    Environmental,
    ResourceExhaustion,
    SecurityPolicy,
    GuardViolation,
    ContractMismatch,
    Unknown,
}

pub fn classify_failure(class_str: &str) -> FailureClass {
    match class_str {
        "transient" => FailureClass::Transient,
        "environmental" => FailureClass::Environmental,
        "resource_exhaustion" => FailureClass::ResourceExhaustion,
        "security_policy" => FailureClass::SecurityPolicy,
        "guard_violation" => FailureClass::GuardViolation,
        "contract_mismatch" => FailureClass::ContractMismatch,
        "deterministic" => FailureClass::Deterministic,
        _ => FailureClass::Unknown, // Treated as deterministic (never permissive)
    }
}
