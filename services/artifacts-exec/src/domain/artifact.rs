//! M20 Executable Artifacts — Aggregate & Lifecycle State
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §4.2, ADR-0056

use super::values::{ArtifactId, Capability, ModuleHash, WasmLimits};
use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ExecStatus {
    Authored,
    Validated,
    Runnable,
    Executing,
    Executed,
    Audited,
    Revoked,
    Purged,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutableArtifact {
    pub artifact_id: ArtifactId,
    pub producing_work_order_id: String, // REQUIRED provenance edge (ADR-0056)
    pub module_hash: ModuleHash,
    pub entrypoint: String,
    pub requested_capabilities: BTreeSet<Capability>,
    pub limits: WasmLimits,
    pub api_version: String,
    pub signature: String,
    pub status: ExecStatus,
}

impl ExecutableArtifact {
    pub fn new(
        artifact_id: ArtifactId,
        producing_work_order_id: impl Into<String>,
        module_hash: ModuleHash,
        entrypoint: impl Into<String>,
        requested_capabilities: BTreeSet<Capability>,
        limits: WasmLimits,
        signature: impl Into<String>,
    ) -> Result<Self, String> {
        let wo_id = producing_work_order_id.into();
        if wo_id.trim().is_empty() {
            return Err(
                "producing_work_order_id is required and cannot be empty (ADR-0056)".to_string(),
            );
        }

        limits.validate()?;

        Ok(Self {
            artifact_id,
            producing_work_order_id: wo_id,
            module_hash,
            entrypoint: entrypoint.into(),
            requested_capabilities,
            limits,
            api_version: "1.0.0".to_string(),
            signature: signature.into(),
            status: ExecStatus::Authored,
        })
    }

    pub fn is_runnable(&self) -> bool {
        matches!(self.status, ExecStatus::Runnable | ExecStatus::Audited)
    }
}
