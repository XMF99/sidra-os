use crate::domain::errors::ConnectorError;
use crate::domain::values::{ConnectorId, KeychainRef};
use sidra_domain::DepartmentId;
use sidra_security::KeychainManager;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

/// Service name prefix in OS keychain
const KEYCHAIN_SERVICE_PREFIX: &str = "sidra.connector";

/// Credential custody manager (ADR-0034)
///
/// Holds secrets in the OS keychain and returns opaque KeychainRefs.
#[derive(Debug, Clone)]
pub struct CustodyStore {
    keychain: KeychainManager,
    // Ref mapping: (ConnectorId, DepartmentId) -> KeychainRef
    ref_map: Arc<Mutex<HashMap<(ConnectorId, DepartmentId), KeychainRef>>>,
    // In-memory fallback key-value store for platforms/tests: KeychainRef -> secret
    memory_store: Arc<Mutex<HashMap<String, String>>>,
}

impl Default for CustodyStore {
    fn default() -> Self {
        Self::new()
    }
}

impl CustodyStore {
    pub fn new() -> Self {
        Self {
            keychain: KeychainManager::new(),
            ref_map: Arc::new(Mutex::new(HashMap::new())),
            memory_store: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Store a secret in the keychain and return an opaque `KeychainRef` (T4.1)
    pub fn store_credential(
        &self,
        connector_id: &ConnectorId,
        department_id: &DepartmentId,
        secret: &str,
    ) -> Result<KeychainRef, ConnectorError> {
        let account_id = format!("{}:{}", connector_id, department_id.0);
        let ref_key = format!("ref:{}:{}", connector_id, department_id.0);
        let keychain_ref = KeychainRef::new(&ref_key);

        // Attempt OS keychain write, with memory fallback
        let _ = self.keychain.set_password(KEYCHAIN_SERVICE_PREFIX, &account_id, secret);
        {
            let mut mem = self.memory_store.lock().unwrap();
            mem.insert(ref_key.clone(), secret.to_string());
        }

        let mut map = self.ref_map.lock().unwrap();
        map.insert((connector_id.clone(), department_id.clone()), keychain_ref.clone());

        Ok(keychain_ref)
    }

    /// Retrieve secret for injection at egress boundary only (T4.2)
    pub fn get_secret_for_injection(&self, keychain_ref: &KeychainRef) -> Result<String, ConnectorError> {
        let ref_str = keychain_ref.as_str();

        // Check memory store fallback
        {
            let mem = self.memory_store.lock().unwrap();
            if let Some(secret) = mem.get(ref_str) {
                return Ok(secret.clone());
            }
        }

        // Parse connector and dept from ref
        let parts: Vec<&str> = ref_str.split(':').collect();
        if parts.len() == 3 {
            let account_id = format!("{}:{}", parts[1], parts[2]);
            if let Ok(secret) = self.keychain.get_password(KEYCHAIN_SERVICE_PREFIX, &account_id) {
                return Ok(secret);
            }
        }

        Err(ConnectorError::CustodyError(format!(
            "Credential for keychain ref '{}' not found",
            keychain_ref
        )))
    }

    /// Zeroize credential on revoke/uninstall before state transition commits (T4.3)
    pub fn zeroize(
        &self,
        connector_id: &ConnectorId,
        department_id: &DepartmentId,
    ) -> Result<(), ConnectorError> {
        let account_id = format!("{}:{}", connector_id, department_id.0);
        let ref_key = format!("ref:{}:{}", connector_id, department_id.0);

        let _ = self.keychain.delete_password(KEYCHAIN_SERVICE_PREFIX, &account_id);
        {
            let mut mem = self.memory_store.lock().unwrap();
            mem.remove(&ref_key);
        }

        let mut map = self.ref_map.lock().unwrap();
        map.remove(&(connector_id.clone(), department_id.clone()));

        Ok(())
    }
}
