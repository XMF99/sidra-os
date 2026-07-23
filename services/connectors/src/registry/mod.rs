pub mod grants;

pub use grants::GrantStore;

use crate::domain::errors::ConnectorError;
use crate::domain::manifest::ConnectorManifest;
use crate::domain::values::ConnectorId;
use crate::lifecycle::state::ConnectorState;
use crate::manifest::parse::parse_manifest_toml;
use crate::manifest::validate::validate_install;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// Connector Registry holding installed connector manifests and lifecycle states
#[derive(Debug, Clone, Default)]
pub struct ConnectorRegistry {
    manifests: Arc<Mutex<HashMap<ConnectorId, ConnectorManifest>>>,
    statuses: Arc<Mutex<HashMap<ConnectorId, ConnectorState>>>,
    pub grant_store: GrantStore,
}

impl ConnectorRegistry {
    pub fn new() -> Self {
        Self {
            manifests: Arc::new(Mutex::new(HashMap::new())),
            statuses: Arc::new(Mutex::new(HashMap::new())),
            grant_store: GrantStore::new(),
        }
    }

    /// Install a connector from manifest TOML (T2.1 - T2.5)
    pub fn install_connector(
        &self,
        manifest_toml: &str,
        developer_mode: bool,
    ) -> Result<ConnectorId, ConnectorError> {
        let manifest = parse_manifest_toml(manifest_toml)?;
        validate_install(&manifest, manifest_toml, developer_mode)?;

        let id = manifest.id.clone();
        let mut manifests = self.manifests.lock().unwrap();
        let mut statuses = self.statuses.lock().unwrap();

        manifests.insert(id.clone(), manifest);
        statuses.insert(id.clone(), ConnectorState::Installed);

        Ok(id)
    }

    /// Retrieve an installed manifest
    pub fn get_manifest(&self, id: &ConnectorId) -> Option<ConnectorManifest> {
        let manifests = self.manifests.lock().unwrap();
        manifests.get(id).cloned()
    }

    /// Retrieve connector lifecycle status
    pub fn get_status(&self, id: &ConnectorId) -> Option<ConnectorState> {
        let statuses = self.statuses.lock().unwrap();
        statuses.get(id).cloned()
    }

    /// Update connector lifecycle status
    pub fn set_status(&self, id: &ConnectorId, status: ConnectorState) {
        let mut statuses = self.statuses.lock().unwrap();
        statuses.insert(id.clone(), status);
    }

    /// List all installed connectors with their status
    pub fn list_connectors(&self) -> Vec<(ConnectorId, ConnectorState)> {
        let statuses = self.statuses.lock().unwrap();
        statuses.iter().map(|(id, st)| (id.clone(), *st)).collect()
    }

    /// Uninstall a connector
    pub fn uninstall_connector(
        &self,
        id: &ConnectorId,
        revoked_at: &str,
    ) -> Result<(), ConnectorError> {
        let mut manifests = self.manifests.lock().unwrap();
        let mut statuses = self.statuses.lock().unwrap();

        if manifests.remove(id).is_some() {
            statuses.insert(id.clone(), ConnectorState::Uninstalled);
            self.grant_store.revoke_all_for_connector(id, revoked_at);
            Ok(())
        } else {
            Err(ConnectorError::OperationNotFound {
                connector_id: id.as_str().to_string(),
                operation_name: "uninstall".to_string(),
            })
        }
    }
}
