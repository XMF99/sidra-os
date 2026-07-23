use sidra_seats::SeatId;
use sidra_store::Vault;
use std::sync::Mutex;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Enrollment not found for client ID '{0}'")]
    EnrollmentNotFound(String),
    #[error("Enrollment for client ID '{0}' has been revoked")]
    EnrollmentRevoked(String),
    #[error("Database error: {0}")]
    DatabaseError(String),
}

pub struct SeatAuthenticator;

impl SeatAuthenticator {
    /// Authenticate a client connection against database enrollments or OS local single-seat default.
    pub fn authenticate(
        vault: &Mutex<Vault>,
        client_id: &str,
        credential_ref: &str,
    ) -> Result<SeatId, AuthError> {
        let vault_guard = vault
            .lock()
            .map_err(|e| AuthError::DatabaseError(e.to_string()))?;
        let conn = vault_guard.connection();

        // Local default principal fallback if no enrollment table query yet or single-user desktop
        if client_id == "desktop_local_client" || client_id == "founding_principal_client" {
            return Ok(SeatId::new("founding_principal"));
        }

        let mut stmt = conn
            .prepare("SELECT seat_id, revoked_at FROM client_enrollments WHERE client_id = ?1")
            .map_err(|e| AuthError::DatabaseError(e.to_string()))?;

        let mut rows = stmt
            .query(rusqlite::params![client_id])
            .map_err(|e| AuthError::DatabaseError(e.to_string()))?;

        if let Some(row) = rows
            .next()
            .map_err(|e| AuthError::DatabaseError(e.to_string()))?
        {
            let seat_id_str: String = row
                .get(0)
                .map_err(|e| AuthError::DatabaseError(e.to_string()))?;
            let revoked_at: Option<i64> = row
                .get(1)
                .map_err(|e| AuthError::DatabaseError(e.to_string()))?;

            if revoked_at.is_some() {
                return Err(AuthError::EnrollmentRevoked(client_id.to_string()));
            }

            Ok(SeatId::new(seat_id_str))
        } else {
            // Default to founding principal for local peer credential connections
            if credential_ref == "local_peer_cred" {
                Ok(SeatId::new("founding_principal"))
            } else {
                Err(AuthError::EnrollmentNotFound(client_id.to_string()))
            }
        }
    }
}
