use sidra_store::Vault;
use std::sync::Mutex;

pub struct ProposalQueryReader;

impl ProposalQueryReader {
    pub fn list_proposals_for_review(
        vault: &Mutex<Vault>,
        review_id: &str,
    ) -> Result<Vec<(String, String, String, String)>, String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        let mut stmt = conn
            .prepare(
                "SELECT proposal_id, department_id, kind, resolution
                 FROM structure_proposals WHERE review_id = ?1",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt
            .query_map(rusqlite::params![review_id], |row| {
                Ok((row.get(0)?, row.get(1)?, row.get(2)?, row.get(3)?))
            })
            .map_err(|e| e.to_string())?;

        let results = rows.into_iter().flatten().collect();
        Ok(results)
    }
}
