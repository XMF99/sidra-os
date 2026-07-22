use sidra_domain::{Event, EventInput};
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AdmissionError {
    #[error("Chain verification failed: {0}")]
    ChainVerificationFailed(String),
    #[error("Database error: {0}")]
    DatabaseError(String),
}

pub struct EventAdmissionController;

impl EventAdmissionController {
    pub fn admit_event(vault: &Mutex<Vault>, event: &Event) -> Result<bool, AdmissionError> {
        let vault_guard = vault.lock().map_err(|e| AdmissionError::DatabaseError(e.to_string()))?;
        let conn = vault_guard.connection();

        // Check if event already exists by event_id
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM events WHERE event_id = ?1)",
                rusqlite::params![event.event_id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            return Ok(false); // Idempotent no-op
        }

        let input = EventInput {
            event_id: event.event_id.clone(),
            event_type: event.event_type.clone(),
            aggregate_type: event.aggregate_type.clone(),
            aggregate_id: event.aggregate_id.clone(),
            payload: event.payload.clone(),
            metadata: event.metadata.clone(),
            timestamp: event.timestamp.clone(),
        };

        EventLogRepository::append(conn, &input).map_err(|e| AdmissionError::DatabaseError(e.to_string()))?;
        Ok(true)
    }
}
