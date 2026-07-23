use sidra_seats::SeatId;
use sidra_store::Vault;
use std::sync::Mutex;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum EnrollmentError {
    #[error("Database error during enrollment: {0}")]
    DatabaseError(String),
    #[error("Client ID '{0}' is already enrolled")]
    AlreadyEnrolled(String),
}

pub struct ClientEnrollmentService;

impl ClientEnrollmentService {
    pub fn enroll_client(
        vault: &Mutex<Vault>,
        client_id: &str,
        seat_id: &SeatId,
        credential_ref: &str,
        timestamp: i64,
    ) -> Result<(), EnrollmentError> {
        let vault_guard = vault
            .lock()
            .map_err(|e| EnrollmentError::DatabaseError(e.to_string()))?;
        let conn = vault_guard.connection();

        conn.execute(
            "INSERT INTO client_enrollments (client_id, seat_id, credential_ref, enrolled_at, revoked_at)
             VALUES (?1, ?2, ?3, ?4, NULL)
             ON CONFLICT(client_id) DO UPDATE SET seat_id=?2, credential_ref=?3, enrolled_at=?4, revoked_at=NULL",
            rusqlite::params![client_id, seat_id.0, credential_ref, timestamp],
        )
        .map_err(|e| EnrollmentError::DatabaseError(e.to_string()))?;

        Ok(())
    }

    pub fn revoke_enrollment(
        vault: &Mutex<Vault>,
        client_id: &str,
        timestamp: i64,
    ) -> Result<(), EnrollmentError> {
        let vault_guard = vault
            .lock()
            .map_err(|e| EnrollmentError::DatabaseError(e.to_string()))?;
        let conn = vault_guard.connection();

        conn.execute(
            "UPDATE client_enrollments SET revoked_at = ?2 WHERE client_id = ?1",
            rusqlite::params![client_id, timestamp],
        )
        .map_err(|e| EnrollmentError::DatabaseError(e.to_string()))?;

        Ok(())
    }
}
