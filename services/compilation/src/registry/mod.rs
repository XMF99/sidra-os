use sidra_store::Vault;
use std::sync::Mutex;

pub struct CompilationRegistryReader;

impl CompilationRegistryReader {
    pub fn list_candidates(vault: &Mutex<Vault>) -> Result<Vec<(String, String, String)>, String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        let mut stmt = conn
            .prepare("SELECT candidate_id, playbook_id, status FROM workflow_candidates")
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map([], |row| {
                Ok((row.get(0)?, row.get(1)?, row.get(2)?))
            })
            .map_err(|e| e.to_string())?;

        let mut results = Vec::new();
        for r in rows {
            if let Ok(res) = r {
                results.push(res);
            }
        }
        Ok(results)
    }
}
