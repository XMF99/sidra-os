use crate::domain::values::{DeviceId, DeviceSeq, PeerId, VersionVector};
use sidra_store::Vault;
use std::sync::Mutex;

pub struct CursorTracker;

impl CursorTracker {
    pub fn update_cursor(
        vault: &Mutex<Vault>,
        peer_id: &PeerId,
        device_id: &DeviceId,
        seq: DeviceSeq,
        timestamp: u64,
    ) -> Result<(), String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        conn.execute(
            "INSERT INTO sync_cursors (peer_id, target_device_id, last_admitted_seq, updated_at)
             VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(peer_id, target_device_id) DO UPDATE SET last_admitted_seq = ?3, updated_at = ?4",
            rusqlite::params![peer_id.0, device_id.0, seq.0, timestamp],
        )
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    pub fn get_vector_for_peer(vault: &Mutex<Vault>, peer_id: &PeerId) -> Result<VersionVector, String> {
        let vault_guard = vault.lock().map_err(|e| e.to_string())?;
        let conn = vault_guard.connection();

        let mut stmt = conn
            .prepare("SELECT target_device_id, last_admitted_seq FROM sync_cursors WHERE peer_id = ?1")
            .map_err(|e| e.to_string())?;

        let mut vector = VersionVector::new();
        let rows = stmt
            .query_map(rusqlite::params![peer_id.0], |row| {
                let dev: String = row.get(0)?;
                let seq: u64 = row.get(1)?;
                Ok((dev, seq))
            })
            .map_err(|e| e.to_string())?;

        for r in rows {
            if let Ok((dev_str, seq_num)) = r {
                if let Ok(dev_id) = DeviceId::new(dev_str) {
                    vector.update(dev_id, DeviceSeq(seq_num));
                }
            }
        }

        Ok(vector)
    }
}
