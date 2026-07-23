use crate::domain::values::{ArchetypeId, EvalSetId, EvalSetVersion};
use crate::evalset::types::{EvaluationCase, EvaluationSet, ScoringSpec};
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use ulid::Ulid;

pub struct EvalSetRegistrar;

impl EvalSetRegistrar {
    pub fn register_evaluation_set(
        vault: &Mutex<Vault>,
        archetype_id: ArchetypeId,
        cases: Vec<EvaluationCase>,
        scoring_spec: ScoringSpec,
        registered_by: String,
        timestamp: u64,
    ) -> Result<EvaluationSet, String> {
        // Enforce Author != Reviewer (GUIDE §3 item 9): archetype cannot author its own eval set
        if registered_by.contains(&archetype_id.0) {
            return Err(format!(
                "Archetype {} cannot author the evaluation set that gates it",
                archetype_id.0
            ));
        }

        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        // Query current max eval_set_version for this archetype
        let max_ver: u32 = conn
            .query_row(
                "SELECT COALESCE(MAX(eval_set_version), 0) FROM evaluation_sets WHERE archetype_id = ?1",
                rusqlite::params![archetype_id.0],
                |row| row.get(0),
            )
            .unwrap_or(0);

        let new_ver = EvalSetVersion(max_ver + 1);
        let eval_set_id = EvalSetId(format!("es_{}", Ulid::new()));

        let cases_json = serde_json::to_string(&cases).map_err(|e| e.to_string())?;
        let scoring_json = serde_json::to_string(&scoring_spec).map_err(|e| e.to_string())?;

        conn.execute(
            "INSERT INTO evaluation_sets (eval_set_id, archetype_id, eval_set_version, cases_json, scoring_spec_json, registered_at, registered_by)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            rusqlite::params![
                eval_set_id.0,
                archetype_id.0,
                new_ver.0,
                cases_json,
                scoring_json,
                timestamp as i64,
                registered_by,
            ],
        )
        .map_err(|e| e.to_string())?;

        let input = sidra_domain::EventInput {
            event_id: format!("evt_{}", Ulid::new()),
            event_type: "EvaluationSetRegistered".to_string(),
            aggregate_type: "evolution".to_string(),
            aggregate_id: eval_set_id.0.clone(),
            payload: format!(
                "Registered Evaluation Set Version {} for archetype {}",
                new_ver.0, archetype_id.0
            ),
            metadata: format!(r#"{{"actor":"{}"}}"#, registered_by),
            timestamp: timestamp.to_string(),
        };
        EventLogRepository::append(conn, &input).map_err(|e| e.to_string())?;

        Ok(EvaluationSet {
            eval_set_id,
            archetype_id,
            eval_set_version: new_ver,
            cases,
            scoring_spec,
            registered_at: timestamp,
            registered_by,
        })
    }
}
