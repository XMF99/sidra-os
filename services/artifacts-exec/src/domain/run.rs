//! M20 Executable Artifacts — Run & Effect Records
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §4.4, ADR-0054

use super::values::{ArtifactId, ArtifactRunId, Capability};
use serde::{Deserialize, Serialize};
use std::collections::BTreeSet;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum RunOutcome {
    Success,
    FuelExhausted,
    EpochDeadlineHit,
    MemoryCapExceeded,
    Denied(String),
    Error(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EffectRecord {
    pub effect_class: u8, // 0, 1, 2, 3
    pub operation: String,
    pub target_resource: String,
    pub verdict: String, // "allowed" | "fenced" | "needs_approval" | "denied"
    pub at: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArtifactRun {
    pub id: ArtifactRunId,
    pub artifact_id: ArtifactId,
    pub invoked_by: String,
    pub invoking_context_work_order: String,
    pub effective_grant: BTreeSet<Capability>,
    pub fuel_used: u64,
    pub wall_ms: u64,
    pub outcome: RunOutcome,
    pub effects: Vec<EffectRecord>,
    pub at: u64,
}

impl ArtifactRun {
    pub fn new(
        artifact_id: ArtifactId,
        invoked_by: impl Into<String>,
        invoking_work_order: impl Into<String>,
        effective_grant: BTreeSet<Capability>,
        now: u64,
    ) -> Self {
        Self {
            id: ArtifactRunId::generate(),
            artifact_id,
            invoked_by: invoked_by.into(),
            invoking_context_work_order: invoking_work_order.into(),
            effective_grant,
            fuel_used: 0,
            wall_ms: 0,
            outcome: RunOutcome::Success,
            effects: Vec::new(),
            at: now,
        }
    }
}
