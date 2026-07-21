use serde::{Deserialize, Serialize};

/// Connector Lifecycle States (§3.1)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ConnectorState {
    Installed,
    Granted,
    Authorizing,
    Operating,
    Unreachable,
    Revoked,
    Uninstalled,
}

impl ConnectorState {
    pub fn is_operating(&self) -> bool {
        matches!(self, ConnectorState::Operating)
    }

    pub fn is_terminal(&self) -> bool {
        matches!(self, ConnectorState::Revoked | ConnectorState::Uninstalled)
    }
}
