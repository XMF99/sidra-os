use crate::custody::CustodyStore;
use crate::domain::errors::ConnectorError;
use crate::domain::values::ConnectorId;
use sidra_domain::DepartmentId;
use std::collections::HashSet;
use std::sync::{Arc, Mutex};

/// Token refresh scheduler (ADR-0037, T5.4)
///
/// Serialized per grant so concurrent calls trigger at most ONE refresh.
#[derive(Debug, Clone, Default)]
pub struct RefreshScheduler {
    active_refreshes: Arc<Mutex<HashSet<(ConnectorId, DepartmentId)>>>,
}

impl RefreshScheduler {
    pub fn new() -> Self {
        Self::default()
    }

    /// Refresh token for (ConnectorId, DepartmentId)
    pub fn refresh_token(
        &self,
        connector_id: &ConnectorId,
        department_id: &DepartmentId,
        custody_store: &CustodyStore,
    ) -> Result<(), ConnectorError> {
        let key = (connector_id.clone(), department_id.clone());

        // Serialized check
        {
            let mut set = self.active_refreshes.lock().unwrap();
            if set.contains(&key) {
                // Refresh already in progress by another concurrent call
                return Ok(());
            }
            set.insert(key.clone());
        }

        let result = self.do_refresh(connector_id, department_id, custody_store);

        {
            let mut set = self.active_refreshes.lock().unwrap();
            set.remove(&key);
        }

        result
    }

    fn do_refresh(
        &self,
        connector_id: &ConnectorId,
        department_id: &DepartmentId,
        custody_store: &CustodyStore,
    ) -> Result<(), ConnectorError> {
        let refreshed_secret = format!("tok_refreshed_{}_{}", connector_id, ulid::Ulid::new());
        custody_store.store_credential(connector_id, department_id, &refreshed_secret)?;
        Ok(())
    }
}
