//! Vault Crate - Event Store & Zero-Knowledge Security Storage.
//! Compliant with ADR-0002 and E01 Data Architecture.

use rusqlite::{params, Connection};
use sha2::{Digest, Sha256};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum VaultError {
    #[error("Database error: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("Hash chain corruption at sequence {0}")]
    HashChainCorrupted(u64),
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
}

#[derive(Debug, Clone)]
pub struct SystemEventRecord {
    pub sequence_number: u64,
    pub event_id: String,
    pub stream_id: String,
    pub department_id: String,
    pub event_type: String,
    pub payload_json: String,
    pub actor_id: String,
    pub timestamp_utc: String,
    pub previous_hash: String,
    pub current_hash: String,
}

pub fn compute_event_hash(
    seq: u64,
    event_id: &str,
    prev_hash: &str,
    payload_json: &str,
    timestamp: &str,
) -> String {
    let mut hasher = Sha256::new();
    hasher.update(seq.to_be_bytes());
    hasher.update(event_id.as_bytes());
    hasher.update(prev_hash.as_bytes());
    hasher.update(payload_json.as_bytes());
    hasher.update(timestamp.as_bytes());
    format!("{:x}", hasher.finalize())
}

pub struct EventStore {
    conn: Connection,
}

impl EventStore {
    pub fn in_memory() -> Result<Self, VaultError> {
        let conn = Connection::open_in_memory()?;
        let store = Self { conn };
        store.init_tables()?;
        Ok(store)
    }

    pub fn init_tables(&self) -> Result<(), VaultError> {
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS system_event_log (
                sequence_number INTEGER PRIMARY KEY AUTOINCREMENT,
                event_id TEXT NOT NULL UNIQUE,
                stream_id TEXT NOT NULL,
                department_id TEXT NOT NULL,
                event_type TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                actor_id TEXT NOT NULL,
                timestamp_utc TEXT NOT NULL,
                previous_hash TEXT NOT NULL,
                current_hash TEXT NOT NULL
            );",
            [],
        )?;
        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    pub fn append_event(
        &mut self,
        event_id: &str,
        stream_id: &str,
        department_id: &str,
        event_type: &str,
        payload_json: &str,
        actor_id: &str,
        timestamp_utc: &str,
    ) -> Result<u64, VaultError> {
        let tx = self.conn.transaction()?;

        let mut stmt = tx.prepare(
            "SELECT sequence_number, current_hash FROM system_event_log ORDER BY sequence_number DESC LIMIT 1;",
        )?;

        let (seq, prev_hash): (u64, String) = stmt
            .query_row([], |row| Ok((row.get(0)?, row.get(1)?)))
            .unwrap_or((0, "0".repeat(64)));
        drop(stmt);

        let new_seq = seq + 1;
        let new_hash = compute_event_hash(new_seq, event_id, &prev_hash, payload_json, timestamp_utc);

        tx.execute(
            "INSERT INTO system_event_log (
                event_id, stream_id, department_id, event_type, payload_json, actor_id, timestamp_utc, previous_hash, current_hash
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9);",
            params![
                event_id,
                stream_id,
                department_id,
                event_type,
                payload_json,
                actor_id,
                timestamp_utc,
                prev_hash,
                new_hash
            ],
        )?;

        tx.commit()?;
        Ok(new_seq)
    }

    pub fn verify_integrity(&self) -> Result<bool, VaultError> {
        let mut stmt = self.conn.prepare(
            "SELECT sequence_number, event_id, payload_json, timestamp_utc, previous_hash, current_hash FROM system_event_log ORDER BY sequence_number ASC;",
        )?;

        let rows = stmt.query_map([], |row| {
            Ok((
                row.get::<_, u64>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
                row.get::<_, String>(5)?,
            ))
        })?;

        let mut prev_expected_hash = "0".repeat(64);

        for row in rows {
            let (seq, event_id, payload, timestamp, prev_hash, current_hash) = row?;
            if prev_hash != prev_expected_hash {
                return Ok(false);
            }
            let calculated_hash = compute_event_hash(seq, &event_id, &prev_hash, &payload, &timestamp);
            if calculated_hash != current_hash {
                return Ok(false);
            }
            prev_expected_hash = current_hash;
        }

        Ok(true)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_event_store_append_and_verify() {
        let mut store = EventStore::in_memory().unwrap();
        let seq1 = store
            .append_event(
                "evt-1",
                "str-1",
                "DEPT_FINANCE",
                "INVOICE_CREATED",
                "{\"amount\":100}",
                "user-1",
                "2026-07-30T05:00:00Z",
            )
            .unwrap();

        assert_eq!(seq1, 1);

        let seq2 = store
            .append_event(
                "evt-2",
                "str-1",
                "DEPT_FINANCE",
                "INVOICE_APPROVED",
                "{\"amount\":100}",
                "user-2",
                "2026-07-30T05:05:00Z",
            )
            .unwrap();

        assert_eq!(seq2, 2);
        assert!(store.verify_integrity().unwrap());
    }
}
