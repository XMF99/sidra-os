use crate::confirm::actor::ConfirmActorGuard;
use crate::domain::revision::CharterRevision;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use ulid::Ulid;

pub struct RevisionRejector;

impl RevisionRejector {
    pub fn reject_revision(
        vault: &Mutex<Vault>,
        revision: &CharterRevision,
        principal_actor: &str,
        reason: &str,
        timestamp: u64,
    ) -> Result<(), String> {
        ConfirmActorGuard::assert_principal_seat(principal_actor)?;

        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        conn.execute(
            "UPDATE charter_revisions SET status = 'REJECTED', updated_at = ?1 WHERE revision_id = ?2",
            rusqlite::params![timestamp as i64, revision.revision_id.0],
        )
        .map_err(|e| e.to_string())?;

        let input = sidra_domain::EventInput {
            event_id: format!("evt_{}", Ulid::new()),
            event_type: "CharterRevisionRejected".to_string(),
            aggregate_type: "evolution".to_string(),
            aggregate_id: revision.revision_id.0.clone(),
            payload: format!(
                "Rejected Revision {} for archetype {}: {}",
                revision.revision_id.0, revision.archetype_id.0, reason
            ),
            metadata: format!(r#"{{"actor":"{}"}}"#, principal_actor),
            timestamp: timestamp.to_string(),
        };
        EventLogRepository::append(conn, &input).map_err(|e| e.to_string())?;

        Ok(())
    }
}
