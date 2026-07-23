use sidra_store::Vault;
use std::sync::Mutex;
use thiserror::Error;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum EmptyGuardError {
    #[error("Target Vault is not empty: found {0} existing operational data rows")]
    VaultNotEmpty(usize),
    #[error("Database error: {0}")]
    DatabaseError(String),
}

pub struct EmptyVaultGuard;

impl EmptyVaultGuard {
    pub fn assert_empty(vault: &Mutex<Vault>) -> Result<(), EmptyGuardError> {
        let vault_guard = vault
            .lock()
            .map_err(|e| EmptyGuardError::DatabaseError(e.to_string()))?;
        let conn = vault_guard.connection();

        // Check data-side tables for existing rows
        let data_tables = [
            "engagements",
            "work_orders",
            "deliverables",
            "meetings",
            "decisions",
            "memory_chunks",
            "budgets",
        ];

        let mut data_rows = 0;
        for table in data_tables {
            let sql = format!("SELECT COUNT(*) FROM {}", table);
            let count: usize = conn.query_row(&sql, [], |row| row.get(0)).unwrap_or(0);
            data_rows += count;
        }

        if data_rows > 0 {
            return Err(EmptyGuardError::VaultNotEmpty(data_rows));
        }

        Ok(())
    }
}
