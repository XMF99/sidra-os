use crate::domain::values::{ConnectorId, KeychainRef, Scope};
use serde::{Deserialize, Serialize};
use sidra_domain::DepartmentId;

/// Connector grant struct - the isolation primitive (ADR-0035)
///
/// Binds a connector to EXACTLY ONE department. Carries a required `DepartmentId`
/// and has no firm-wide variant to prevent firm-wide permissions.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ConnectorGrant {
    pub connector_id: ConnectorId,
    pub department_id: DepartmentId,
    pub scopes: Vec<Scope>,
    pub keychain_ref: Option<KeychainRef>,
    pub granted_at: String,
    pub granted_by: String,
    pub revoked_at: Option<String>,
}

impl ConnectorGrant {
    pub fn new(
        connector_id: ConnectorId,
        department_id: DepartmentId,
        scopes: Vec<Scope>,
        granted_by: impl Into<String>,
        granted_at: impl Into<String>,
    ) -> Self {
        Self {
            connector_id,
            department_id,
            scopes,
            keychain_ref: None,
            granted_at: granted_at.into(),
            granted_by: granted_by.into(),
            revoked_at: None,
        }
    }

    pub fn is_active(&self) -> bool {
        self.revoked_at.is_none()
    }
}
