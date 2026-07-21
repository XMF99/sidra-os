use crate::domain::auth::AuthConfig;
use crate::domain::operation::Operation;
use crate::domain::values::{ConnectorId, ConnectorVersion};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

/// Egress allowlist configuration in connector.toml
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EgressConfig {
    pub allow: Vec<String>,
}

/// Signature block in connector.toml
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SignatureBlock {
    pub publisher: String,
    pub signature_bytes: Option<String>,
}

/// Connector manifest aggregate representing connector.toml
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ConnectorManifest {
    pub id: ConnectorId,
    pub name: String,
    pub version: ConnectorVersion,
    pub sidra_api: String,
    pub publisher: String,
    pub description: String,
    pub auth: AuthConfig,
    pub egress: EgressConfig,
    pub operations: Vec<Operation>,
    pub signature: Option<SignatureBlock>,
}

impl ConnectorManifest {
    /// Compute SHA-256 digest of the manifest content for integrity tracking
    pub fn compute_hash(&self) -> String {
        let mut hasher = Sha256::new();
        hasher.update(self.id.as_str().as_bytes());
        hasher.update(self.name.as_bytes());
        hasher.update(self.version.to_string().as_bytes());
        hasher.update(self.publisher.as_bytes());
        for host in &self.egress.allow {
            hasher.update(host.as_bytes());
        }
        for op in &self.operations {
            hasher.update(op.name.as_str().as_bytes());
            hasher.update(op.capability.as_str().as_bytes());
            hasher.update(op.path.as_bytes());
        }
        format!("{:x}", hasher.finalize())
    }
}
