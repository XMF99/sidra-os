use serde::{Deserialize, Serialize};

/// 16 Connector Domain Event variants on the hash chain per Architecture §11.2
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum ConnectorEvent {
    ConnectorInstalled {
        actor: String,
        connector_id: String,
        version: String,
        manifest_hash: String,
        timestamp: String,
    },
    ConnectorGranted {
        actor: String,
        connector_id: String,
        department_id: String,
        scopes: Vec<String>,
        timestamp: String,
    },
    ConnectorRevoked {
        actor: String,
        connector_id: String,
        department_id: String,
        timestamp: String,
    },
    ConnectorAuthorizationStarted {
        actor: String,
        connector_id: String,
        department_id: String,
        authorize_url: String,
        timestamp: String,
    },
    ConnectorAuthorized {
        actor: String,
        connector_id: String,
        department_id: String,
        keychain_ref: String,
        expires_at: Option<String>,
        timestamp: String,
    },
    ConnectorTokenRefreshed {
        actor: String,
        connector_id: String,
        department_id: String,
        new_expires_at: Option<String>,
        timestamp: String,
    },
    ConnectorTokenRefreshFailed {
        actor: String,
        connector_id: String,
        department_id: String,
        reason: String,
        timestamp: String,
    },
    ConnectorCallDispatched {
        actor: String,
        connector_id: String,
        department_id: String,
        operation_name: String,
        host: String,
        timestamp: String,
    },
    ConnectorCallSucceeded {
        actor: String,
        connector_id: String,
        department_id: String,
        operation_name: String,
        host: String,
        latency_ms: u64,
        timestamp: String,
    },
    ConnectorCallDenied {
        actor: String,
        connector_id: String,
        department_id: String,
        operation_name: String,
        reason: String,
        timestamp: String,
    },
    ConnectorEgressBlocked {
        actor: String,
        connector_id: String,
        department_id: String,
        host: String,
        timestamp: String,
    },
    ConnectorApprovalRequested {
        actor: String,
        connector_id: String,
        department_id: String,
        operation_name: String,
        effect_class: u8,
        timestamp: String,
    },
    ConnectorApprovalResolved {
        actor: String,
        connector_id: String,
        department_id: String,
        operation_name: String,
        approved: bool,
        timestamp: String,
    },
    ConnectorUnreachable {
        actor: String,
        connector_id: String,
        department_id: String,
        reason: String,
        timestamp: String,
    },
    ConnectorRecovered {
        actor: String,
        connector_id: String,
        department_id: String,
        timestamp: String,
    },
    ConnectorUninstalled {
        actor: String,
        connector_id: String,
        timestamp: String,
    },
}

impl ConnectorEvent {
    pub fn event_type(&self) -> &'static str {
        match self {
            ConnectorEvent::ConnectorInstalled { .. } => "ConnectorInstalled",
            ConnectorEvent::ConnectorGranted { .. } => "ConnectorGranted",
            ConnectorEvent::ConnectorRevoked { .. } => "ConnectorRevoked",
            ConnectorEvent::ConnectorAuthorizationStarted { .. } => "ConnectorAuthorizationStarted",
            ConnectorEvent::ConnectorAuthorized { .. } => "ConnectorAuthorized",
            ConnectorEvent::ConnectorTokenRefreshed { .. } => "ConnectorTokenRefreshed",
            ConnectorEvent::ConnectorTokenRefreshFailed { .. } => "ConnectorTokenRefreshFailed",
            ConnectorEvent::ConnectorCallDispatched { .. } => "ConnectorCallDispatched",
            ConnectorEvent::ConnectorCallSucceeded { .. } => "ConnectorCallSucceeded",
            ConnectorEvent::ConnectorCallDenied { .. } => "ConnectorCallDenied",
            ConnectorEvent::ConnectorEgressBlocked { .. } => "ConnectorEgressBlocked",
            ConnectorEvent::ConnectorApprovalRequested { .. } => "ConnectorApprovalRequested",
            ConnectorEvent::ConnectorApprovalResolved { .. } => "ConnectorApprovalResolved",
            ConnectorEvent::ConnectorUnreachable { .. } => "ConnectorUnreachable",
            ConnectorEvent::ConnectorRecovered { .. } => "ConnectorRecovered",
            ConnectorEvent::ConnectorUninstalled { .. } => "ConnectorUninstalled",
        }
    }
}
