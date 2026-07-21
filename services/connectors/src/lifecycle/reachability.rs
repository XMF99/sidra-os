use crate::domain::values::ConnectorId;
use crate::lifecycle::state::ConnectorState;
use crate::registry::ConnectorRegistry;

/// Manage unreachable / recovered reachability state transitions (T9.2, AC7)
pub fn handle_unreachable(
    connector_id: &ConnectorId,
    registry: &ConnectorRegistry,
    _reason: &str,
) {
    registry.set_status(connector_id, ConnectorState::Unreachable);
}

pub fn handle_recovered(
    connector_id: &ConnectorId,
    registry: &ConnectorRegistry,
) {
    registry.set_status(connector_id, ConnectorState::Operating);
}
