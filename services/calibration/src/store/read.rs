use crate::domain::values::ParameterVersion;
use crate::store::params::CalibrationParameterSet;
use sidra_store::Vault;
use std::sync::Mutex;

pub struct ParameterStoreReader;

impl ParameterStoreReader {
    pub fn active_parameters(vault: &Mutex<Vault>) -> Result<CalibrationParameterSet, String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        let active_ver: u64 = conn
            .query_row(
                "SELECT version FROM calibration_parameters WHERE active = 1 ORDER BY version DESC LIMIT 1",
                [],
                |row| row.get(0),
            )
            .unwrap_or(0);

        if active_ver == 0 {
            return Ok(CalibrationParameterSet::identity());
        }

        // Return active parameters
        let mut params = CalibrationParameterSet::identity();
        params.version = ParameterVersion(active_ver);
        Ok(params)
    }
}
