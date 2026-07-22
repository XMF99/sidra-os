use crate::domain::revision::CharterRevision;
use crate::domain::values::{CharterVersion, DecisionId};
use sidra_domain::Event;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use ulid::Ulid;

pub struct VersionMaterialiser;

impl VersionMaterialiser {
    /// Sole writer of `agent_versions` in `sidra-evolution` (ADR-0072).
    /// Requires a Principal Decision ID.
    pub fn materialise_new_version(
        vault: &Mutex<Vault>,
        revision: &CharterRevision,
        decision_id: &DecisionId,
        principal_actor: &str,
        timestamp: u64,
    ) -> Result<CharterVersion, String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        let new_ver_num = revision.base_version.0 + 1;

        let charter_json = serde_json::to_string(&revision.proposed_charter).map_err(|e| e.to_string())?;

        // Write one row to agent_versions
        conn.execute(
            "INSERT INTO agent_versions (archetype_id, version, charter_json, decision_id, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            rusqlite::params![
                revision.archetype_id.0,
                new_ver_num,
                charter_json,
                decision_id.0,
                timestamp as i64,
            ],
        )
        .map_err(|e| e.to_string())?;

        // Update revision status to Confirmed
        conn.execute(
            "UPDATE charter_revisions SET status = 'CONFIRMED', decision_id = ?1, updated_at = ?2 WHERE revision_id = ?3",
            rusqlite::params![decision_id.0, timestamp as i64, revision.revision_id.0],
        )
        .map_err(|e| e.to_string())?;

        // Emit CharterRevisionConfirmed event
        let evt = Event {
            id: format!("evt_{}", Ulid::new()),
            timestamp,
            actor: principal_actor.to_string(),
            event_type: "CharterRevisionConfirmed".to_string(),
            payload: format!(
                "Confirmed Revision {} for archetype {} -> Version {} (Decision {})",
                revision.revision_id.0, revision.archetype_id.0, new_ver_num, decision_id.0
            ),
        };
        EventLogRepository::append(conn, &evt).map_err(|e| e.to_string())?;

        Ok(CharterVersion(new_ver_num))
    }
}
