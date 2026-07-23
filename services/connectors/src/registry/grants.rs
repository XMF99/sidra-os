use crate::domain::errors::ConnectorError;
use crate::domain::grant::ConnectorGrant;
use crate::domain::manifest::ConnectorManifest;
use crate::domain::values::{ConnectorId, Scope};
use sidra_domain::DepartmentId;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// Grant store managing per-department connector grants (ADR-0035)
#[derive(Debug, Clone, Default)]
pub struct GrantStore {
    // Key: (ConnectorId, DepartmentId)
    grants: Arc<Mutex<HashMap<(ConnectorId, DepartmentId), ConnectorGrant>>>,
    // Department forbidden scopes cache: DepartmentId -> Vec<Scope>
    forbidden_scopes: Arc<Mutex<HashMap<DepartmentId, Vec<Scope>>>>,
}

impl GrantStore {
    pub fn new() -> Self {
        Self::default()
    }

    /// Register forbidden scopes for a department (ADR-0013 self-denial)
    pub fn set_forbidden_scopes(&self, department_id: DepartmentId, forbidden: Vec<Scope>) {
        let mut map = self.forbidden_scopes.lock().unwrap();
        map.insert(department_id, forbidden);
    }

    /// Create a new connector grant for a specific department (T3.1 - T3.3)
    pub fn grant_connector(
        &self,
        manifest: &ConnectorManifest,
        department_id: DepartmentId,
        requested_scopes: Vec<Scope>,
        granted_by: impl Into<String>,
        granted_at: impl Into<String>,
    ) -> Result<ConnectorGrant, ConnectorError> {
        let granted_by_str = granted_by.into();
        let granted_at_str = granted_at.into();

        // Check T3.2: Forbidden scope check (ADR-0013 self-denial)
        let forbidden = self.get_forbidden_scopes(&department_id);
        for scope in &requested_scopes {
            if forbidden
                .iter()
                .any(|f| f.as_str() == scope.as_str() || f.as_str() == "integration:*:*")
            {
                return Err(ConnectorError::ForbiddenScopeDenied {
                    scope: scope.as_str().to_string(),
                    department_id: department_id.0.clone(),
                });
            }
        }

        // Check T3.3: Scope subset check against manifest capabilities
        for scope in &requested_scopes {
            let matches_manifest = manifest.operations.iter().any(|op| {
                op.capability.as_str() == scope.as_str()
                    || scope.as_str() == format!("integration:{}:*", manifest.id.as_str())
            });

            if !matches_manifest {
                return Err(ConnectorError::GrantError(format!(
                    "Scope '{}' is not declared in connector '{}' manifest",
                    scope, manifest.id
                )));
            }
        }

        let grant = ConnectorGrant::new(
            manifest.id.clone(),
            department_id.clone(),
            requested_scopes,
            granted_by_str,
            granted_at_str,
        );

        let mut map = self.grants.lock().unwrap();
        map.insert((manifest.id.clone(), department_id), grant.clone());

        Ok(grant)
    }

    /// Get active grant for (ConnectorId, DepartmentId)
    pub fn get_grant(
        &self,
        connector_id: &ConnectorId,
        department_id: &DepartmentId,
    ) -> Option<ConnectorGrant> {
        let map = self.grants.lock().unwrap();
        map.get(&(connector_id.clone(), department_id.clone()))
            .filter(|g| g.is_active())
            .cloned()
    }

    /// List all active grants for a specific department
    pub fn list_grants_for_department(&self, department_id: &DepartmentId) -> Vec<ConnectorGrant> {
        let map = self.grants.lock().unwrap();
        map.values()
            .filter(|g| &g.department_id == department_id && g.is_active())
            .cloned()
            .collect()
    }

    /// Revoke a grant for (ConnectorId, DepartmentId)
    pub fn revoke_grant(
        &self,
        connector_id: &ConnectorId,
        department_id: &DepartmentId,
        revoked_at: impl Into<String>,
    ) -> Result<(), ConnectorError> {
        let mut map = self.grants.lock().unwrap();
        let key = (connector_id.clone(), department_id.clone());
        if let Some(grant) = map.get_mut(&key) {
            grant.revoked_at = Some(revoked_at.into());
            grant.keychain_ref = None;
            Ok(())
        } else {
            Err(ConnectorError::NoGrant {
                connector_id: connector_id.as_str().to_string(),
                department_id: department_id.0.clone(),
            })
        }
    }

    /// Revoke all grants for a connector (uninstall)
    pub fn revoke_all_for_connector(&self, connector_id: &ConnectorId, revoked_at: &str) {
        let mut map = self.grants.lock().unwrap();
        for ((c_id, _), grant) in map.iter_mut() {
            if c_id == connector_id {
                grant.revoked_at = Some(revoked_at.to_string());
                grant.keychain_ref = None;
            }
        }
    }

    fn get_forbidden_scopes(&self, department_id: &DepartmentId) -> Vec<Scope> {
        let map = self.forbidden_scopes.lock().unwrap();
        map.get(department_id).cloned().unwrap_or_default()
    }
}
