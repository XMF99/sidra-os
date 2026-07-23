//! Sidra OS Decision Service (`sidra-decisions`)
//! Primary authority for Decision records, Principal confirmations, and audit chain verification.

use rusqlite::{params, Connection};
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
    pub fn new(
        id: impl Into<String>,
        title: impl Into<String>,
        rationale: impl Into<String>,
        confirmed_by: impl Into<String>,
    ) -> Self {
        Self {
            id: id.into(),
            title: title.into(),
            rationale: rationale.into(),
            confirmed_by: confirmed_by.into(),
            created_at: chrono::Utc::now().to_rfc3339(),
        }
    }
}

pub struct DecisionEngineRepository;

impl DecisionEngineRepository {
    pub fn save_decision(conn: &Connection, decision: &Decision) -> Result<(), String> {
        conn.execute(
            "INSERT INTO decisions (id, subject_id, decision_type, status, created_at)
             VALUES (?1, ?2, ?3, 'APPROVED', ?4)",
            params![
                decision.id,
                decision.title,
                decision.rationale,
                decision.created_at
            ],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    }
}
