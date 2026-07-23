use crate::domain::activation::CandidateActivation;
use crate::domain::candidate::CandidateStatus;
use sidra_decisions::{Decision, DecisionEngineRepository};
use sidra_domain::EventInput;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use ulid::Ulid;

pub struct CandidateActivator;

impl CandidateActivator {
    pub fn activate_candidate(
        vault: &Mutex<Vault>,
        candidate_id: &str,
        principal_actor: &str,
        timestamp: u64,
    ) -> Result<(CandidateActivation, String), String> {
        if principal_actor.starts_with("agent:") || principal_actor.starts_with("archetype:") {
            return Err(
                "An agent actor cannot activate a workflow candidate (GUIDE §3 item 9)".to_string(),
            );
        }

        let decision_id = format!("dec_comp_{}", Ulid::new());

        // 1. Raise Decision record via Decision Engine
        let decision = Decision::new(
            decision_id.clone(),
            format!("Activate Compiled Workflow Candidate {}", candidate_id),
            format!("Principal activation of candidate {}", candidate_id),
            principal_actor,
        );

        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        DecisionEngineRepository::save_decision(conn, &decision).map_err(|e| e.to_string())?;

        // 2. Query playbook_id for candidate
        let playbook_id: String = conn
            .query_row(
                "SELECT playbook_id FROM workflow_candidates WHERE candidate_id = ?1",
                rusqlite::params![candidate_id],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        // 3. Promote playbook status proposed -> active
        conn.execute(
            "UPDATE playbooks SET status = 'active', updated_at = ?1 WHERE id = ?2",
            rusqlite::params![timestamp as i64, playbook_id],
        )
        .map_err(|e| e.to_string())?;

        // 4. Update workflow_candidates status -> ACTIVATED
        conn.execute(
            "UPDATE workflow_candidates SET status = 'ACTIVATED' WHERE candidate_id = ?1",
            rusqlite::params![candidate_id],
        )
        .map_err(|e| e.to_string())?;

        // 5. Insert row into candidate_activations with decision_id NOT NULL
        let activation_id = format!("act_{}", Ulid::new());
        conn.execute(
            "INSERT INTO candidate_activations (activation_id, candidate_id, decision_id, activated_playbook_id, resolution, actor, resolved_at)
             VALUES (?1, ?2, ?3, ?4, 'ACTIVATED', ?5, ?6)",
            rusqlite::params![
                activation_id,
                candidate_id,
                decision_id,
                playbook_id,
                principal_actor,
                timestamp as i64,
            ],
        )
        .map_err(|e| e.to_string())?;

        // 6. Emit CandidateActivated event
        let input = EventInput {
            event_id: format!("evt_{}", Ulid::new()),
            event_type: "CandidateActivated".to_string(),
            aggregate_type: "compilation".to_string(),
            aggregate_id: candidate_id.to_string(),
            payload: format!(
                "Activated Workflow Candidate {} (Playbook {}) via Decision {}",
                candidate_id, playbook_id, decision_id
            ),
            metadata: format!(r#"{{"actor":"{}"}}"#, principal_actor),
            timestamp: timestamp.to_string(),
        };
        EventLogRepository::append(conn, &input).map_err(|e| e.to_string())?;

        let activation = CandidateActivation::new(
            activation_id,
            candidate_id.to_string(),
            decision_id,
            playbook_id.clone(),
            CandidateStatus::Activated,
            principal_actor.to_string(),
            timestamp,
        )?;

        Ok((activation, playbook_id))
    }
}
