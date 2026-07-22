use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum CanonEntryError {
    #[error("Ineligible Canon Entry: source_type must be 'principal', got '{0}'")]
    InvalidSourceType(String),
    #[error("Ineligible Canon Entry: scope must be 'firm', got '{0}'")]
    InvalidScope(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StructuralCanonEntry {
    pub id: String,
    pub statement: String,
    pub source_type: String,
    pub scope: String,
    pub status: String,
}

impl StructuralCanonEntry {
    pub fn new(
        id: impl Into<String>,
        statement: impl Into<String>,
        source_type: impl Into<String>,
        scope: impl Into<String>,
        status: impl Into<String>,
    ) -> Result<Self, CanonEntryError> {
        let st = source_type.into();
        let sc = scope.into();

        if st != "principal" {
            return Err(CanonEntryError::InvalidSourceType(st));
        }
        if sc != "firm" {
            return Err(CanonEntryError::InvalidScope(sc));
        }

        Ok(Self {
            id: id.into(),
            statement: statement.into(),
            source_type: st,
            scope: sc,
            status: status.into(),
        })
    }
}
