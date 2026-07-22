use crate::exporter::select::TemplateSelection;
use thiserror::Error;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum BoundaryCheckError {
    #[error("Rule 1 Failure: Structure-only mapping violated for table '{0}'")]
    DataSideTableReferenced(String),
    #[error("Rule 3 Failure: Ineligible Canon Entry '{0}' with source_type '{1}'")]
    IneligibleCanonSourceType(String, String),
    #[error("Rule 6 Failure: Operational data leak detected in packaged bytes for symbol '{0}'")]
    OperationalDataLeak(String),
}

pub struct BoundaryCheckEngine;

impl BoundaryCheckEngine {
    pub fn validate_selection(selection: &TemplateSelection) -> Result<(), BoundaryCheckError> {
        // Check Rule 3: Canon Eligibility
        for entry in &selection.chosen_canon {
            if entry.source_type != "principal" {
                return Err(BoundaryCheckError::IneligibleCanonSourceType(
                    entry.id.clone(),
                    entry.source_type.clone(),
                ));
            }
        }

        Ok(())
    }

    pub fn scan_packaged_bytes(bytes: &[u8]) -> Result<(), BoundaryCheckError> {
        let text = String::from_utf8_lossy(bytes);
        
        let forbidden_keywords = [
            "engagement_id",
            "event_hash",
            "memory_chunk",
            "budget_cents",
            "seat_id:seat:",
            "keychain_secret",
        ];

        for kw in forbidden_keywords {
            if text.contains(kw) {
                return Err(BoundaryCheckError::OperationalDataLeak(kw.to_string()));
            }
        }

        Ok(())
    }
}
