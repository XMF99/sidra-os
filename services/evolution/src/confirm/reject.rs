use crate::confirm::actor::ConfirmActorGuard;
use crate::domain::revision::CharterRevision;
use sidra_domain::Event;
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

        let evt = Event {
            id: format!("evt_{}", Ulid::new()),
            timestamp,
            actor: principal_actor.to_string(),
            event_type: "CharterRevisionRejected".to_string(),
            payload: format!(
                "Rejected Revision {} for archetype {}: {}",
                revision.revision_id.0, revision.archetype_id.0, reason
            ),
        };
        EventLogRepository::append(conn, &evt).map_err(|e| e.to_string())?;

        Ok(())
    }
}
