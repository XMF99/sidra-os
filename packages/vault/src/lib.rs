//! Vault Crate - Event Store & Zero-Knowledge Security Storage.
//! Compliant with ADR-0002 and E01 Data Architecture.

use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
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
    #[error("Payload encryption error: {0}")]
    EncryptionError(String),
    #[error("Payload decryption error: {0}")]
    DecryptionError(String),
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
    pub is_encrypted: bool,
}

fn hex_encode(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{:02x}", b)).collect()
}

fn hex_decode(s: &str) -> Result<Vec<u8>, VaultError> {
    if !s.len().is_multiple_of(2) {
        return Err(VaultError::EncryptionError("Invalid hex length".into()));
    }
    (0..s.len())
        .step_by(2)
        .map(|i| {
            u8::from_str_radix(&s[i..i + 2], 16)
                .map_err(|e| VaultError::EncryptionError(format!("Invalid hex byte: {}", e)))
        })
        .collect()
}

/// Derives a 256-bit (32-byte) key array from key string via SHA-256.
fn derive_256bit_key(key: &str) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(key.as_bytes());
    hasher.finalize().into()
}

/// Generates a 96-bit (12-byte) deterministic or unique nonce.
fn generate_nonce(event_id: &str, seq: u64) -> [u8; 12] {
    let mut hasher = Sha256::new();
    hasher.update(event_id.as_bytes());
    hasher.update(seq.to_be_bytes());
    let hash = hasher.finalize();
    let mut nonce = [0u8; 12];
    nonce.copy_from_slice(&hash[..12]);
    nonce
}

/// Authenticated AES-256-GCM Encryption (256-bit key, 96-bit nonce, 128-bit GCM tag).
pub fn encrypt_payload_aes_gcm(plain_text: &str, key: &str, event_id: &str, seq: u64) -> Result<String, VaultError> {
    let key_bytes = derive_256bit_key(key);
    let cipher = Aes256Gcm::new_from_slice(&key_bytes)
        .map_err(|e| VaultError::EncryptionError(format!("AES-GCM key init error: {}", e)))?;

    let nonce_bytes = generate_nonce(event_id, seq);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plain_text.as_bytes())
        .map_err(|e| VaultError::EncryptionError(format!("AES-256-GCM encryption failed: {}", e)))?;

    Ok(format!("AES256GCM:{}:{}", hex_encode(&nonce_bytes), hex_encode(&ciphertext)))
}

/// Authenticated AES-256-GCM Decryption.
pub fn decrypt_payload_aes_gcm(cipher_text: &str, key: &str) -> Result<String, VaultError> {
    if !cipher_text.starts_with("AES256GCM:") {
        return Ok(cipher_text.to_string());
    }

    let parts: Vec<&str> = cipher_text.split(':').collect();
    if parts.len() != 3 {
        return Err(VaultError::DecryptionError("Invalid AES256GCM format".into()));
    }

    let nonce_bytes = hex_decode(parts[1])?;
    let ciphertext = hex_decode(parts[2])?;

    if nonce_bytes.len() != 12 {
        return Err(VaultError::DecryptionError("Invalid AES-GCM nonce length".into()));
    }

    let key_bytes = derive_256bit_key(key);
    let cipher = Aes256Gcm::new_from_slice(&key_bytes)
        .map_err(|e| VaultError::DecryptionError(format!("AES-GCM key init error: {}", e)))?;

    let nonce = Nonce::from_slice(&nonce_bytes);

    let decrypted_bytes = cipher
        .decrypt(nonce, ciphertext.as_ref())
        .map_err(|_| VaultError::DecryptionError("AES-256-GCM authentication failed or wrong key/tampered payload".into()))?;

    String::from_utf8(decrypted_bytes)
        .map_err(|e| VaultError::DecryptionError(format!("Invalid UTF-8 plaintext: {}", e)))
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
    encryption_key: String,
}

impl EventStore {
    pub fn in_memory() -> Result<Self, VaultError> {
        let conn = Connection::open_in_memory()?;
        let store = Self {
            conn,
            encryption_key: "THEKY_VAULT_AES256GCM_MASTER_KEY".into(),
        };
        store.init_tables()?;
        Ok(store)
    }

    pub fn open_file(path: &str) -> Result<Self, VaultError> {
        let conn = Connection::open(path)?;
        let store = Self {
            conn,
            encryption_key: "THEKY_VAULT_AES256GCM_MASTER_KEY".into(),
        };
        store.init_tables()?;
        Ok(store)
    }

    pub fn set_encryption_key(&mut self, key: &str) {
        self.encryption_key = key.to_string();
    }

    pub fn get_raw_payload_from_db(&self, event_id: &str) -> Result<String, VaultError> {
        let mut stmt = self.conn.prepare("SELECT payload_json FROM system_event_log WHERE event_id = ?1")?;
        let payload: String = stmt.query_row(params![event_id], |row| row.get(0))?;
        Ok(payload)
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
                current_hash TEXT NOT NULL,
                is_encrypted INTEGER NOT NULL DEFAULT 1
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
        let encrypted_payload = encrypt_payload_aes_gcm(payload_json, &self.encryption_key, event_id, new_seq)?;
        let new_hash = compute_event_hash(new_seq, event_id, &prev_hash, &encrypted_payload, timestamp_utc);

        tx.execute(
            "INSERT INTO system_event_log (
                event_id, stream_id, department_id, event_type, payload_json, actor_id, timestamp_utc, previous_hash, current_hash, is_encrypted
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 1);",
            params![
                event_id,
                stream_id,
                department_id,
                event_type,
                encrypted_payload,
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

    #[test]
    fn test_aes_256_gcm_encryption_decryption() {
        let plain = "{\"secret_val\":42,\"confidential\":\"bank_account_123\"}";
        let key = "THEKY_MASTER_KEY_256";
        let encrypted = encrypt_payload_aes_gcm(plain, key, "evt-100", 1).unwrap();

        assert!(encrypted.starts_with("AES256GCM:"));
        assert!(!encrypted.contains("secret_val"));
        assert!(!encrypted.contains("bank_account_123"));

        let decrypted = decrypt_payload_aes_gcm(&encrypted, key).unwrap();
        assert_eq!(decrypted, plain);
    }

    #[test]
    fn test_aes_256_gcm_wrong_key_fails() {
        let plain = "{\"secret_val\":42}";
        let key = "RIGHT_KEY";
        let wrong_key = "WRONG_KEY";
        let encrypted = encrypt_payload_aes_gcm(plain, key, "evt-101", 2).unwrap();

        let result = decrypt_payload_aes_gcm(&encrypted, wrong_key);
        assert!(result.is_err());
    }

    #[test]
    fn test_aes_256_gcm_tamper_detection() {
        let plain = "{\"secret_val\":42}";
        let key = "RIGHT_KEY";
        let encrypted = encrypt_payload_aes_gcm(plain, key, "evt-102", 3).unwrap();

        let mut tampered = encrypted.clone();
        tampered.pop(); // Modify ciphertext end
        tampered.push('0');

        let result = decrypt_payload_aes_gcm(&tampered, key);
        assert!(result.is_err());
    }

    #[test]
    fn test_db_direct_query_proves_no_plaintext() {
        let mut store = EventStore::in_memory().unwrap();
        let plain_payload = "{\"confidential_ssn\":\"999-00-1234\"}";
        store
            .append_event(
                "evt-secure-1",
                "str-1",
                "DEPT_HR",
                "EMPLOYEE_ADDED",
                plain_payload,
                "admin",
                "2026-07-30T05:00:00Z",
            )
            .unwrap();

        let db_payload = store.get_raw_payload_from_db("evt-secure-1").unwrap();

        assert!(db_payload.starts_with("AES256GCM:"));
        assert!(!db_payload.contains("999-00-1234"));
        assert!(!db_payload.contains("confidential_ssn"));
    }
}
