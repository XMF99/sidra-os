use crate::domain::values::DecisionId;
use sidra_decisions::{Decision, DecisionEngineRepository};
use sidra_store::Vault;
use std::sync::Mutex;

pub struct EvolutionDecisionCreator;

impl EvolutionDecisionCreator {
    pub fn create_principal_decision(
        vault: &Mutex<Vault>,
        revision_id: &str,
        archetype_id: &str,
        principal_actor: &str,
        eval_report_summary: &str,
        _timestamp: u64,
    ) -> Result<DecisionId, String> {
        let decision_id = format!("dec_evo_{}", ulid::Ulid::new());

        let decision = Decision::new(
            decision_id.clone(),
            format!("Confirm Charter Evolution for Archetype {}", archetype_id),
            format!(
                "Principal confirmation of charter revision {} based on evaluation report: {}",
                revision_id, eval_report_summary
            ),
            principal_actor,
        );

        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        DecisionEngineRepository::save_decision(conn, &decision).map_err(|e| e.to_string())?;

        Ok(DecisionId(decision_id))
    }
}
