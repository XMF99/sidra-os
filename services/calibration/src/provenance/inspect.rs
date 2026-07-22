use crate::domain::values::ParameterVersion;
use crate::runner::CalibrationRunResult;
use sidra_store::Vault;
use std::sync::Mutex;

pub struct CalibrationInspector;

impl CalibrationInspector {
    pub fn inspect_calibration(
        vault: &Mutex<Vault>,
        version: Option<ParameterVersion>,
    ) -> Result<Option<CalibrationRunResult>, String> {
        let _vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let _ver = version.unwrap_or(ParameterVersion::identity());
        Ok(None)
    }
}
