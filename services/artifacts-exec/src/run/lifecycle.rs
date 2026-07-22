//! M20 Executable Artifacts — Lifecycle Transitions
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §3.1, §3.2

use crate::domain::{ExecStatus, ExecutableArtifact};

pub fn transition_status(
    artifact: &mut ExecutableArtifact,
    new_status: ExecStatus,
) -> Result<(), String> {
    match (artifact.status, new_status) {
        (ExecStatus::Authored, ExecStatus::Validated) => artifact.status = ExecStatus::Validated,
        (ExecStatus::Validated, ExecStatus::Runnable) => artifact.status = ExecStatus::Runnable,
        (ExecStatus::Runnable, ExecStatus::Executing) => artifact.status = ExecStatus::Executing,
        (ExecStatus::Executing, ExecStatus::Executed) => artifact.status = ExecStatus::Executed,
        (ExecStatus::Executed, ExecStatus::Audited) => artifact.status = ExecStatus::Audited,
        (ExecStatus::Audited, ExecStatus::Runnable) => artifact.status = ExecStatus::Runnable,
        (s, ExecStatus::Revoked) if s != ExecStatus::Purged => artifact.status = ExecStatus::Revoked,
        (ExecStatus::Revoked, ExecStatus::Purged) => artifact.status = ExecStatus::Purged,
        (from, to) => return Err(format!("Invalid state transition from {:?} to {:?}", from, to)),
    }
    Ok(())
}
