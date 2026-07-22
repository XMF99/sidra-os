//! M20 Executable Artifacts — Domain Events
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §11.2, ADR-0054, ADR-0056

use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;
use super::values::{ArtifactId, Capability, ModuleHash};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ArtifactAuthored {
    pub artifact_id: ArtifactId,
    pub producing_work_order_id: String,
    pub module_hash: ModuleHash,
    pub authored_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ArtifactValidated {
    pub artifact_id: ArtifactId,
    pub validated_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ArtifactValidationFailed {
    pub artifact_id: ArtifactId,
    pub rule_failed: String,
    pub failed_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ArtifactGrantDerived {
    pub artifact_id: ArtifactId,
    pub producing_work_order_id: String,
    pub frozen_grant: BTreeSet<Capability>,
    pub derived_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ArtifactGrantRefused {
    pub artifact_id: ArtifactId,
    pub producing_work_order_id: String,
    pub offending_capability: String, // The exit-criterion event capability name
    pub refused_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ArtifactRunStarted {
    pub run_id: String,
    pub artifact_id: ArtifactId,
    pub invoking_work_order_id: String,
    pub effective_grant: BTreeSet<Capability>,
    pub started_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ArtifactEffectAuthorized {
    pub run_id: String,
    pub artifact_id: ArtifactId,
    pub effect_class: u8,
    pub operation: String,
    pub target_resource: String,
    pub at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ArtifactEffectDenied {
    pub run_id: String,
    pub artifact_id: ArtifactId,
    pub effect_class: u8,
    pub operation: String,
    pub reason: String,
    pub at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ArtifactRunCompleted {
    pub run_id: String,
    pub artifact_id: ArtifactId,
    pub fuel_used: u64,
    pub wall_ms: u64,
    pub completed_at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct ArtifactGrantRevoked {
    pub artifact_id: ArtifactId,
    pub revoked_by: String,
    pub revoked_at: u64,
}
