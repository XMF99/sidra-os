use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoundaryAttestation {
    pub partition_version: String,
    pub excluded_tables: Vec<String>,
    pub digest: String,
}

impl BoundaryAttestation {
    pub fn compute(bytes: &[u8], excluded_tables: Vec<String>) -> Self {
        let mut hasher = Sha256::new();
        hasher.update(bytes);
        let digest = format!("{:x}", hasher.finalize());

        Self {
            partition_version: "3.0.0".to_string(),
            excluded_tables,
            digest,
        }
    }
}
