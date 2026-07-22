use crate::domain::values::PeerId;
use sidra_store::Vault;
use std::sync::Mutex;
use ulid::Ulid;

pub struct MergeIndexLog;

impl MergeIndexLog {
    pub fn record_merge(
        vault: &Mutex<Vault>,
        peer_id: &PeerId,
        admitted_count: usize,
        frontier_order_key: &str,
        timestamp: u64,
    ) -> Result<String, String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        let merge_id = format!("mrg_{}", Ulid::new());

        conn.execute(
            "INSERT INTO merge_log (merge_id, peer_id, admitted_count, frontier_order_key, merged_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            rusqlite::params![merge_id, peer_id.0, admitted_count as i64, frontier_order_key, timestamp],
        )
        .map_err(|e| e.to_string())?;

        Ok(merge_id)
    }
}
