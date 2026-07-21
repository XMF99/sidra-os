use crate::errors::SecurityError;
use keyring::Entry;

pub const KEYCHAIN_SERVICE_NAME: &str = "com.sidra.os.vault";
pub const KEYCHAIN_MASTER_KEY_USER: &str = "master_key";

pub struct KeychainManager;

impl KeychainManager {
    /// Retrieve master vault encryption passphrase from the OS Keychain
    pub fn get_master_key() -> Result<String, SecurityError> {
        let entry = Entry::new(KEYCHAIN_SERVICE_NAME, KEYCHAIN_MASTER_KEY_USER)
            .map_err(|e| SecurityError::Keychain(e.to_string()))?;
        entry
            .get_password()
            .map_err(|e| SecurityError::Keychain(e.to_string()))
    }

    /// Store or update master vault encryption passphrase in the OS Keychain
    pub fn store_master_key(secret: &str) -> Result<(), SecurityError> {
        let entry = Entry::new(KEYCHAIN_SERVICE_NAME, KEYCHAIN_MASTER_KEY_USER)
            .map_err(|e| SecurityError::Keychain(e.to_string()))?;
        entry
            .set_password(secret)
            .map_err(|e| SecurityError::Keychain(e.to_string()))
    }

    /// Delete master vault encryption passphrase from OS Keychain
    pub fn delete_master_key() -> Result<(), SecurityError> {
        let entry = Entry::new(KEYCHAIN_SERVICE_NAME, KEYCHAIN_MASTER_KEY_USER)
            .map_err(|e| SecurityError::Keychain(e.to_string()))?;
        entry
            .delete_password()
            .map_err(|e| SecurityError::Keychain(e.to_string()))
    }
}
