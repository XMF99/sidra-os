//! M20 Executable Artifacts Store Repository
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §11.1, ADR-0054, ADR-0056

use rusqlite::{params, Connection, Result};
use sidra_artifacts_exec::{
    ArtifactCapabilityGrant, ArtifactId, ArtifactRun, Capability, ExecStatus, ExecutableArtifact,
    ModuleHash, WasmLimits,
};
use std::collections::BTreeSet;

pub struct ArtifactExecStoreRepository<'a> {
    conn: &'a Connection,
}

impl<'a> ArtifactExecStoreRepository<'a> {
    pub fn new(conn: &'a Connection) -> Self {
        Self { conn }
    }

    pub fn insert_executable_artifact(&self, artifact: &ExecutableArtifact) -> Result<()> {
        let req_caps_json = serde_json::to_string(&artifact.requested_capabilities).unwrap();
        let limits_json = serde_json::to_string(&artifact.limits).unwrap();
        let status_str = match artifact.status {
            ExecStatus::Authored => "authored",
            ExecStatus::Validated => "validated",
            ExecStatus::Runnable => "runnable",
            ExecStatus::Executing => "executing",
            ExecStatus::Executed => "executed",
            ExecStatus::Audited => "audited",
            ExecStatus::Revoked => "revoked",
            ExecStatus::Purged => "purged",
        };

        self.conn.execute(
            "INSERT INTO executable_artifacts (
                artifact_id, producing_work_order_id, module_hash, entrypoint,
                requested_capabilities_json, limits_json, api_version, signature, status
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                artifact.artifact_id.0,
                artifact.producing_work_order_id,
                artifact.module_hash.0,
                artifact.entrypoint,
                req_caps_json,
                limits_json,
                artifact.api_version,
                artifact.signature,
                status_str,
            ],
        )?;

        Ok(())
    }

    pub fn insert_capability_grant(&self, grant: &ArtifactCapabilityGrant) -> Result<()> {
        let frozen_json = serde_json::to_string(&grant.frozen_grant).unwrap();
        self.conn.execute(
            "INSERT INTO artifact_capability_grants (
                artifact_id, derived_from_work_order, frozen_grant_json, computed_at, computed_by, revoked_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                grant.artifact_id.0,
                grant.derived_from_work_order,
                frozen_json,
                grant.computed_at as i64,
                grant.computed_by,
                grant.revoked_at.map(|t| t as i64),
            ],
        )?;

        Ok(())
    }

    pub fn insert_run_record(&self, run: &ArtifactRun) -> Result<()> {
        let eff_json = serde_json::to_string(&run.effective_grant).unwrap();
        let effects_json = serde_json::to_string(&run.effects).unwrap();
        let outcome_str = format!("{:?}", run.outcome);

        self.conn.execute(
            "INSERT INTO artifact_runs (
                id, artifact_id, invoked_by, invoking_work_order,
                effective_grant_json, fuel_used, wall_ms, outcome, effects_json, at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                run.id.0,
                run.artifact_id.0,
                run.invoked_by,
                run.invoking_context_work_order,
                eff_json,
                run.fuel_used as i64,
                run.wall_ms as i64,
                outcome_str,
                effects_json,
                run.at as i64,
            ],
        )?;

        Ok(())
    }
}
