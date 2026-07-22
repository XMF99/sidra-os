//! Sidra OS Decision Service (`sidra-decisions`)
//! Primary authority for Decision records, Principal confirmations, and audit chain verification.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Decision {
    pub id: String,
    pub title: String,
    pub rationale: String,
    pub confirmed_by: String,
    pub created_at: String,
}

impl Decision {
    pub fn new(id: impl Into<String>, title: impl Into<String>, rationale: impl Into<String>, confirmed_by: impl Into<String>) -> Self {
        Self {
            id: id.into(),
            title: title.into(),
            rationale: rationale.into(),
            confirmed_by: confirmed_by.into(),
            created_at: chrono::Utc::now().to_rfc3339(),
        }
    }
}
