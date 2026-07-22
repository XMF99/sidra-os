//! M20 Executable Artifacts — Run Host & M9 Sandbox Instantiation
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §6, §9, ADR-0055

use std::collections::BTreeSet;
use crate::domain::{ArtifactCapabilityGrant, ArtifactRun, Capability, ExecutableArtifact, RunOutcome};
use crate::host_fns::LocalHostFunctions;
use super::bounds::ResourceBoundsTracker;

pub struct ArtifactRunHost;

impl ArtifactRunHost {
    /// Execute artifact in reused M9 Wasm sandbox under computed effective grant
    pub fn execute(
        artifact: &ExecutableArtifact,
        grant: &ArtifactCapabilityGrant,
        firm_policy: &BTreeSet<Capability>,
        session: &BTreeSet<Capability>,
        invoking_work_order_id: &str,
        invoked_by_actor: &str,
        args_payload: &[u8],
        now: u64,
    ) -> Result<ArtifactRun, String> {
        if !artifact.is_runnable() {
            return Err(format!(
                "RunError: Artifact '{}' is in status {:?}, which is not runnable",
                artifact.artifact_id.0, artifact.status
            ));
        }

        // 1. Compute effective grant = frozen_grant ∩ firm_policy ∩ session_grants
        let effective_grant = grant.compute_effective_grant(firm_policy, session);

        let mut run = ArtifactRun::new(
            artifact.artifact_id.clone(),
            invoked_by_actor,
            invoking_work_order_id,
            effective_grant.clone(),
            now,
        );

        let mut tracker = ResourceBoundsTracker::new(artifact.limits.clone());

        // Simulate execution fuel consumption
        if let Err(outcome) = tracker.consume_fuel(1_000_000) {
            run.outcome = outcome;
            return Ok(run);
        }
        if let Err(outcome) = tracker.consume_wall_ms(15) {
            run.outcome = outcome;
            return Ok(run);
        }

        // Execute sample local host function call if payload requests vault read
        if !args_payload.is_empty() {
            let path = String::from_utf8_lossy(args_payload);
            match LocalHostFunctions::vault_read(&effective_grant, &path, now) {
                Ok((_bytes, record)) => {
                    run.effects.push(record);
                }
                Err(err) => {
                    run.outcome = RunOutcome::Denied(err);
                    return Ok(run);
                }
            }
        }

        run.fuel_used = tracker.fuel_used();
        run.wall_ms = tracker.wall_ms_used();
        run.outcome = RunOutcome::Success;

        Ok(run)
    }
}
