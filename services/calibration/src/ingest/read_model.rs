use crate::domain::values::{MissionId, TaskSignature};
use serde::{Deserialize, Serialize};
use sidra_store::Vault;
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OutcomeRecordRow {
    pub mission_id: MissionId,
    pub plan_version: u64,
    pub task_signature: TaskSignature,
    pub estimated_cost_p50: f64,
    pub estimated_cost_p90: f64,
    pub actual_cost: f64,
    pub estimated_duration_p50: f64,
    pub estimated_duration_p90: f64,
    pub actual_duration: f64,
    pub estimated_effort_p50: f64,
    pub estimated_effort_p90: f64,
    pub actual_effort: f64,
    pub concluded_at: u64,
}

pub struct OutcomeRecordReader;

impl OutcomeRecordReader {
    pub fn read_concluded_outcomes(vault: &Mutex<Vault>) -> Result<Vec<OutcomeRecordRow>, String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        let mut stmt = conn
            .prepare(
                "SELECT mission_id, plan_version, task_signature,
                        estimated_cost_p50, estimated_cost_p90, actual_cost,
                        estimated_duration_p50, estimated_duration_p90, actual_duration,
                        estimated_effort_p50, estimated_effort_p90, actual_effort,
                        concluded_at
                 FROM mission_outcomes ORDER BY concluded_at ASC",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map([], |row| {
                let m_id: String = row.get(0)?;
                let sig: String = row.get(2)?;
                Ok(OutcomeRecordRow {
                    mission_id: MissionId(m_id),
                    plan_version: row.get(1)?,
                    task_signature: TaskSignature(sig),
                    estimated_cost_p50: row.get(3)?,
                    estimated_cost_p90: row.get(4)?,
                    actual_cost: row.get(5)?,
                    estimated_duration_p50: row.get(6)?,
                    estimated_duration_p90: row.get(7)?,
                    actual_duration: row.get(8)?,
                    estimated_effort_p50: row.get(9)?,
                    estimated_effort_p90: row.get(10)?,
                    actual_effort: row.get(11)?,
                    concluded_at: row.get(12)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let results = rows.into_iter().flatten().collect();
        Ok(results)
    }
}
