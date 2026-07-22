use crate::domain::clock::Hlc;
use crate::domain::values::{DeviceId, DeviceSeq};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EventProvenance {
    pub device_id: DeviceId,
    pub device_seq: DeviceSeq,
    pub hlc: Hlc,
    pub prev_hash: String,
    pub hash: String,
    pub sig: String,
    pub supersedes_event: Option<String>,
}

impl EventProvenance {
    pub fn compute_hash(
        prev_hash: &str,
        device_id: &DeviceId,
        device_seq: DeviceSeq,
        hlc: Hlc,
        payload: &str,
    ) -> String {
        let mut hasher = Sha256::new();
        hasher.update(prev_hash.as_bytes());
        hasher.update(b":");
        hasher.update(device_id.0.as_bytes());
        hasher.update(b":");
        hasher.update(device_seq.0.to_be_bytes());
        hasher.update(b":");
        hasher.update(hlc.wall_ms.to_be_bytes());
        hasher.update(b":");
        hasher.update(hlc.counter.to_be_bytes());
        hasher.update(b":");
        hasher.update(payload.as_bytes());
        format!("{:x}", hasher.finalize())
    }

    pub fn verify_signature(&self) -> bool {
        // Mock / placeholder for Ed25519 signature check
        !self.sig.is_empty()
    }
}
