//! M20 Executable Artifacts — Run Host & M9 Sandbox Instantiation
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §6, §9, ADR-0055

use super::bounds::ResourceBoundsTracker;
use crate::domain::{
    ArtifactCapabilityGrant, ArtifactRun, Capability, ExecutableArtifact, RunOutcome,
};
use crate::host_fns::LocalHostFunctions;
use std::collections::BTreeSet;

pub struct ArtifactRunHost;

pub struct ExecuteArtifactArgs<'a> {
    pub artifact: &'a ExecutableArtifact,
    pub grant: &'a ArtifactCapabilityGrant,
    pub firm_policy: &'a BTreeSet<Capability>,
    pub session: &'a BTreeSet<Capability>,
    pub invoking_work_order_id: &'a str,
    pub invoked_by_actor: &'a str,
    pub args_payload: &'a [u8],
    pub now: u64,
}

impl ArtifactRunHost {
    /// Execute artifact in reused M9 Wasm sandbox under computed effective grant
    pub fn execute(args: ExecuteArtifactArgs<'_>) -> Result<ArtifactRun, String> {
        if !args.artifact.is_runnable() {
            return Err(format!(
                "RunError: Artifact '{}' is in status {:?}, which is not runnable",
                args.artifact.artifact_id.0, args.artifact.status
            ));
        }

        // 1. Compute effective grant = frozen_grant ∩ firm_policy ∩ session_grants
        let effective_grant = args
            .grant
            .compute_effective_grant(args.firm_policy, args.session);

        let mut run = ArtifactRun::new(
            args.artifact.artifact_id.clone(),
            args.invoked_by_actor,
            args.invoking_work_order_id,
            effective_grant.clone(),
            args.now,
        );

        let mut tracker = ResourceBoundsTracker::new(args.artifact.limits.clone());

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
        if !args.args_payload.is_empty() {
            let path = String::from_utf8_lossy(args.args_payload);
            match LocalHostFunctions::vault_read(&effective_grant, &path, args.now) {
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
