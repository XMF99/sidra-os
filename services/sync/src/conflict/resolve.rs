use sidra_domain::Event;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use ulid::Ulid;

pub struct ConflictResolutionAppender;

impl ConflictResolutionAppender {
    pub fn resolve_conflict(
        vault: &Mutex<Vault>,
        conflict_id: &str,
        chosen_value: &str,
        acting_seat_id: &str,
        timestamp: u64,
    ) -> Result<Event, String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        // 1. Update sync_conflicts status
        conn.execute(
            "UPDATE sync_conflicts SET status = 'RESOLVED', resolved_at = ?2 WHERE conflict_id = ?1",
            rusqlite::params![conflict_id, timestamp as i64],
        )
        .map_err(|e| e.to_string())?;

        // 2. Update decisions status
        conn.execute(
            "UPDATE decisions SET status = 'APPROVED', resolved_at = ?2 WHERE id = (SELECT decision_id FROM sync_conflicts WHERE conflict_id = ?1)",
            rusqlite::params![conflict_id, timestamp as i64],
        )
        .map_err(|e| e.to_string())?;

        // 3. Append superseding ConflictResolved event to hash chain
        let input = sidra_domain::EventInput {
            event_id: format!("evt_{}", Ulid::new()),
            event_type: "ConflictResolved".to_string(),
            aggregate_type: "conflict".to_string(),
            aggregate_id: conflict_id.to_string(),
            payload: format!(
                "Conflict {} resolved with value '{}'",
                conflict_id, chosen_value
            ),
            metadata: format!(r#"{{"actor":"{}"}}"#, acting_seat_id),
            timestamp: timestamp.to_string(),
        };

        EventLogRepository::append(conn, &input).map_err(|e| e.to_string())
    }
}
