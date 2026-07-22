use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImportProvenance {
    pub vault_id: String,
    pub template_id: String,
    pub template_version: String,
    pub manifest_hash: String,
    pub installing_seat_id: String,
    pub installed_at: u64,
}
