use sidra_domain::Event;
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

        // Check if event already exists by id
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM events WHERE id = ?1)",
                rusqlite::params![event.id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            return Ok(false); // Idempotent no-op
        }

        EventLogRepository::append(conn, event).map_err(|e| AdmissionError::DatabaseError(e.to_string()))?;
        Ok(true)
    }
}
