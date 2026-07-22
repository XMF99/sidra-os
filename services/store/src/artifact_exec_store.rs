//! M20 Executable Artifacts Store Repository
//! Ref: EXECUTABLE_ARTIFACTS_ARCHITECTURE.md §11.1, ADR-0054, ADR-0056

use rusqlite::{params, Connection, Result};
use sidra_domain::Capability;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
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

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ArtifactId(pub String);

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ModuleHash(pub String);

#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub struct WasmLimits {
    pub max_memory_pages: u32,
    pub max_fuel: u64,
}

#[derive(Debug, Clone, PartialEq)]
pub struct ExecutableArtifact {
    pub artifact_id: ArtifactId,
    pub producing_work_order_id: String,
    pub module_hash: ModuleHash,
    pub entrypoint: String,
    pub requested_capabilities: Vec<Capability>,
    pub limits: WasmLimits,
    pub api_version: String,
    pub signature: String,
    pub status: ExecStatus,
}

#[derive(Debug, Clone, PartialEq)]
pub struct ArtifactCapabilityGrant {
    pub artifact_id: ArtifactId,
    pub derived_from_work_order: String,
    pub frozen_grant: Vec<Capability>,
    pub computed_at: u64,
    pub computed_by: String,
    pub revoked_at: Option<u64>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct ArtifactRun {
    pub id: ArtifactId,
    pub artifact_id: ArtifactId,
    pub invoked_by: String,
    pub invoking_context_work_order: String,
    pub effective_grant: Vec<Capability>,
    pub fuel_used: u64,
    pub wall_ms: u64,
    pub outcome: String,
    pub effects: Vec<String>,
    pub at: u64,
}

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
