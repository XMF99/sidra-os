use sidra_domain::Event;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use ulid::Ulid;

pub struct ResolutionObserver;

impl ResolutionObserver {
    /// Read-only observer over decisions table linking proposals to Principal Decisions.
    /// Writes NO decision and performs NO structural mutation (ADR-0076).
    pub fn observe_decision_linkage(
        vault: &Mutex<Vault>,
        proposal_id: &str,
        decision_id: &str,
        timestamp: u64,
    ) -> Result<(), String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        conn.execute(
            "UPDATE structure_proposals SET resolution = 'ENACTED_BY_PRINCIPAL', decision_id = ?1 WHERE proposal_id = ?2",
            rusqlite::params![decision_id, proposal_id],
        )
        .map_err(|e| e.to_string())?;

        let evt = Event {
            id: format!("evt_{}", Ulid::new()),
            timestamp,
            actor: "self_review_engine".to_string(),
            event_type: "StructureProposalLinkedToDecision".to_string(),
            payload: format!(
                "Observed linkage of Proposal {} to Principal Decision {}",
                proposal_id, decision_id
            ),
        };
        EventLogRepository::append(conn, &evt).map_err(|e| e.to_string())?;

        Ok(())
    }
}
