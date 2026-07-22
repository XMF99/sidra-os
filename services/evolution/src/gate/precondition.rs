use crate::domain::status::RefuseReason;
use crate::domain::values::ArchetypeId;
use crate::evalset::types::EvaluationSet;
use sidra_store::Vault;
use std::sync::Mutex;

pub struct GatePreconditions;

impl GatePreconditions {
    pub fn get_latest_eval_set(
        vault: &Mutex<Vault>,
        archetype_id: &ArchetypeId,
    ) -> Result<EvaluationSet, RefuseReason> {
        let vault_guard = vault.lock().map_err(|_| RefuseReason::NoEvaluationSet)?;
        let conn = vault_guard.connection();

        let mut stmt = conn
            .prepare(
                "SELECT eval_set_id, archetype_id, eval_set_version, cases_json, scoring_spec_json, registered_at, registered_by
                 FROM evaluation_sets WHERE archetype_id = ?1 ORDER BY eval_set_version DESC LIMIT 1",
            )
            .map_err(|_| RefuseReason::NoEvaluationSet)?;

        let eval_set = stmt
            .query_row(rusqlite::params![archetype_id.0], |row| {
                let id: String = row.get(0)?;
                let arch: String = row.get(1)?;
                let ver: u32 = row.get(2)?;
                let cases_str: String = row.get(3)?;
                let spec_str: String = row.get(4)?;
                let reg_at: i64 = row.get(5)?;
                let reg_by: String = row.get(6)?;

                let cases = serde_json::from_str(&cases_str).unwrap_or_default();
                let scoring_spec = serde_json::from_str(&spec_str).unwrap_or_else(|_| {
                    crate::evalset::types::ScoringSpec {
                        pass_threshold: crate::domain::values::Score(0.70),
                        seed: 42,
                    }
                });

                Ok(EvaluationSet {
                    eval_set_id: crate::domain::values::EvalSetId(id),
                    archetype_id: ArchetypeId(arch),
                    eval_set_version: crate::domain::values::EvalSetVersion(ver),
                    cases,
                    scoring_spec,
                    registered_at: reg_at as u64,
                    registered_by: reg_by,
                })
            })
            .map_err(|_| RefuseReason::NoEvaluationSet)?;

        Ok(eval_set)
    }
}
