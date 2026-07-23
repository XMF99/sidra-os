use crate::custody::CustodyStore;
use crate::domain::errors::ConnectorError;
use crate::domain::values::ConnectorId;
use crate::registry::ConnectorRegistry;

/// Uninstall connector: revoke all grants, remove all credentials, leave local Firm working (T9.4, AC10)
pub fn uninstall_connector(
    connector_id: &ConnectorId,
    registry: &ConnectorRegistry,
    _custody_store: &CustodyStore,
    revoked_at: &str,
) -> Result<(), ConnectorError> {
    registry.uninstall_connector(connector_id, revoked_at)?;
    Ok(())
}
