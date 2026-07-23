use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use ulid::Ulid;

pub struct CandidateRejector;

impl CandidateRejector {
    pub fn reject_candidate(
        vault: &Mutex<Vault>,
        candidate_id: &str,
        principal_actor: &str,
        timestamp: u64,
    ) -> Result<(), String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        let playbook_id: String = conn
            .query_row(
                "SELECT playbook_id FROM workflow_candidates WHERE candidate_id = ?1",
                rusqlite::params![candidate_id],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        conn.execute(
            "UPDATE playbooks SET status = 'retired', updated_at = ?1 WHERE id = ?2",
            rusqlite::params![timestamp as i64, playbook_id],
        )
        .map_err(|e| e.to_string())?;

        conn.execute(
            "UPDATE workflow_candidates SET status = 'REJECTED' WHERE candidate_id = ?1",
            rusqlite::params![candidate_id],
        )
        .map_err(|e| e.to_string())?;

        let input = sidra_domain::EventInput {
            event_id: format!("evt_{}", Ulid::new()),
            event_type: "CandidateRejected".to_string(),
            aggregate_type: "compilation".to_string(),
            aggregate_id: candidate_id.to_string(),
            payload: format!("Rejected Workflow Candidate {}", candidate_id),
            metadata: format!(r#"{{"actor":"{}"}}"#, principal_actor),
            timestamp: timestamp.to_string(),
        };
        EventLogRepository::append(conn, &input).map_err(|e| e.to_string())?;

        Ok(())
    }
}
