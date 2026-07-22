use crate::conflict::detect::DetectedFork;
use crate::domain::conflict::SyncConflict;
use sidra_domain::EventInput;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use ulid::Ulid;

pub struct ConflictDecisionEngine;

impl ConflictDecisionEngine {
    pub fn raise_conflict(
        vault: &Mutex<Vault>,
        fork: &DetectedFork,
        timestamp: u64,
    ) -> Result<SyncConflict, String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        let conflict_id = format!("cnfl_{}", Ulid::new());
        let decision_id = format!("dec_sync_{}", Ulid::new());

        // 1. Insert into decisions table
        conn.execute(
            "INSERT INTO decisions (id, subject_id, decision_type, status, created_at)
             VALUES (?1, ?2, 'SyncConflictResolution', 'PENDING', ?3)",
            rusqlite::params![decision_id, fork.cell.to_key(), timestamp as i64],
        )
        .map_err(|e| format!("Failed to raise decision: {}", e))?;

        let sync_conflict = SyncConflict::new(
            &conflict_id,
            &decision_id,
            fork.cell.clone(),
            &fork.event_a.event_id,
            &fork.event_b.event_id,
            &fork.value_a, // Provisional winner
            timestamp,
        )
        .map_err(|e| e.to_string())?;

        // 2. Insert into sync_conflicts table
        conn.execute(
            "INSERT INTO sync_conflicts (conflict_id, decision_id, projection_cell, fork_event_a, fork_event_b, provisional_winner, status, detected_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'PENDING', ?7)",
            rusqlite::params![
                sync_conflict.conflict_id,
                sync_conflict.decision_id,
                sync_conflict.projection_cell.to_key(),
                sync_conflict.fork_event_a,
                sync_conflict.fork_event_b,
                sync_conflict.provisional_winner,
                sync_conflict.detected_at as i64,
            ],
        )
        .map_err(|e| format!("Failed to record sync_conflict: {}", e))?;

        // 3. Emit ConflictDetected event to hash chain
        let input = EventInput {
            event_id: format!("evt_{}", Ulid::new()),
            event_type: "ConflictDetected".to_string(),
            aggregate_type: "conflict".to_string(),
            aggregate_id: sync_conflict.conflict_id.clone(),
            payload: format!(
                "Conflict detected on cell {}: Decision {}",
                fork.cell.to_key(),
                sync_conflict.decision_id
            ),
            metadata: format!(r#"{{"actor":"{}"}}"#, fork.event_a.aggregate_id),
            timestamp: timestamp.to_string(),
        };

        EventLogRepository::append(conn, &input).map_err(|e| e.to_string())?;

        Ok(sync_conflict)
    }
}
