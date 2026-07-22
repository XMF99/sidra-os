use crate::domain::values::ParameterVersion;
use crate::store::params::CalibrationParameterSet;
use sidra_domain::Event;
use sidra_store::{EventLogRepository, Vault};
use std::sync::Mutex;
use ulid::Ulid;

pub struct ParameterReverter;

impl ParameterReverter {
    pub fn revert_calibration(
        vault: &Mutex<Vault>,
        to_version: ParameterVersion,
        timestamp: u64,
    ) -> Result<CalibrationParameterSet, String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        // Check if target version exists
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM calibration_parameters WHERE version = ?1)",
                rusqlite::params![to_version.0],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if !exists {
            return Err(format!("Parameter version {} does not exist", to_version.0));
        }

        // Deactivate all versions and set target version active
        conn.execute("UPDATE calibration_parameters SET active = 0", []).map_err(|e| e.to_string())?;
        conn.execute(
            "UPDATE calibration_parameters SET active = 1 WHERE version = ?1",
            rusqlite::params![to_version.0],
        )
        .map_err(|e| e.to_string())?;

        // Log CalibrationReverted event
        let evt = Event {
            id: format!("evt_{}", Ulid::new()),
            timestamp,
            actor: "founding_principal".to_string(),
            event_type: "CalibrationReverted".to_string(),
            payload: format!("Reverted calibration parameters to Version {}", to_version.0),
        };

        EventLogRepository::append(conn, &evt).map_err(|e| e.to_string())?;

        let mut params = CalibrationParameterSet::identity();
        params.version = to_version;
        Ok(params)
    }
}
