//! Objective Domain Model (T1.4)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §5.3, IMPLEMENTATION_PLAN.md T1.4

use super::values::{ObjectiveId, Weight};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ObjectiveKind {
    CapabilityDelivery,
    QualityGate,
    PerformanceConstraint,
    SecurityEnforcement,
    UserExperience,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct VerificationSpec {
    pub method: String,
    pub target: String,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Objective {
    pub id: ObjectiveId,
    pub statement: String,
    pub kind: ObjectiveKind,
    pub weight: Weight,
    pub criteria: Vec<String>,
    pub verification_specs: Vec<VerificationSpec>,
    pub falsifiable: bool,
}

impl Objective {
    pub fn new(
        id: ObjectiveId,
        statement: String,
        kind: ObjectiveKind,
        weight: Weight,
        criteria: Vec<String>,
        verification_specs: Vec<VerificationSpec>,
    ) -> Result<Self, &'static str> {
        if statement.trim().is_empty() {
            return Err("Objective statement cannot be empty");
        }
        if criteria.is_empty() {
            return Err("Objective must specify at least one criterion");
        }
        if verification_specs.is_empty() {
            return Err("Objective must carry at least one verification spec (ARCH §12.3)");
        }

        // Falsifiability check: Cannot be self-report only
        let has_mechanical_spec = verification_specs.iter().any(|s| s.method != "self_report");

        if !has_mechanical_spec {
            return Err("Non-falsifiable objective rejected: must carry at least one non-self-report verification method (ARCH §12.3, ADR-0025)");
        }

        Ok(Self {
            id,
            statement,
            kind,
            weight,
            criteria,
            verification_specs,
            falsifiable: true,
        })
    }
}
