//! M20 Executable Artifacts — Audit & Event Chain Emission
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §11.2, ADR-0002

use crate::domain::{ArtifactGrantDerived, ArtifactGrantRefused, ArtifactRun};

pub struct ArtifactAuditEmitter;

impl ArtifactAuditEmitter {
    pub fn emit_grant_derived(event: &ArtifactGrantDerived) -> String {
        format!(
            "EVENT[ArtifactGrantDerived]: artifact={} wo={} caps_count={} at={}",
            event.artifact_id.0,
            event.producing_work_order_id,
            event.frozen_grant.len(),
            event.derived_at
        )
    }

    pub fn emit_grant_refused(event: &ArtifactGrantRefused) -> String {
        format!(
            "EVENT[ArtifactGrantRefused]: artifact={} wo={} offending_cap={} at={}",
            event.artifact_id.0,
            event.producing_work_order_id,
            event.offending_capability,
            event.refused_at
        )
    }

    pub fn emit_run_record(run: &ArtifactRun) -> String {
        format!(
            "EVENT[ArtifactRun]: id={} artifact={} invoker_wo={} outcome={:?} fuel={} wall_ms={} effects_count={}",
            run.id.0, run.artifact_id.0, run.invoking_context_work_order, run.outcome, run.fuel_used, run.wall_ms, run.effects.len()
        )
    }
}
