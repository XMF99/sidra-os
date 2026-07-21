use crate::custody::CustodyStore;
use crate::domain::errors::ConnectorError;
use crate::domain::values::ConnectorId;
use crate::lifecycle::state::ConnectorState;
use crate::registry::ConnectorRegistry;
use sidra_domain::DepartmentId;

/// Revoke grant: zeroize credential and close grant before state transition commits (T9.3)
pub fn revoke_grant(
    connector_id: &ConnectorId,
    department_id: &DepartmentId,
    registry: &ConnectorRegistry,
    custody_store: &CustodyStore,
    revoked_at: impl Into<String>,
) -> Result<(), ConnectorError> {
    let revoked_at_str = revoked_at.into();

    // 1. Zeroize credential in OS keychain
    custody_store.zeroize(connector_id, department_id)?;

    // 2. Revoke grant in store
    registry
        .grant_store
        .revoke_grant(connector_id, department_id, revoked_at_str)?;

    // 3. Update status if no remaining active grants
    let active_grants = registry
        .grant_store
        .list_grants_for_department(department_id);

    if active_grants.is_empty() {
        registry.set_status(connector_id, ConnectorState::Revoked);
    }

    Ok(())
}
