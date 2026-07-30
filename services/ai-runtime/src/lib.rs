//! AI Runtime Engine - Agent executor, mission loop & multi-provider router.
//! Compliant with ADR-0004 and E01 AI Runtime Architecture.

use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AIRuntimeError {
    #[error("Provider error: {0}")]
    ProviderError(String),
    #[error("Brief word count exceeds maximum budget of 600 words (actual: {0})")]
    BriefOverflow(usize),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExecutiveTool {
    Retrieve { resource: String },
    Delegate { agent_id: String, task: String },
    Convene { agent_ids: Vec<String> },
    Decide { decision: String },
    Report { brief_markdown: String },
}

pub struct BriefValidator;

impl BriefValidator {
    pub fn validate_word_count(brief_text: &str) -> Result<usize, AIRuntimeError> {
        let word_count = brief_text.split_whitespace().count();
        if word_count > 600 {
            Err(AIRuntimeError::BriefOverflow(word_count))
        } else {
            Ok(word_count)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_brief_validation_under_limit() {
        let brief = "This is a valid brief synthesized by the executive agent.";
        let res = BriefValidator::validate_word_count(brief);
        assert!(res.is_ok());
    }

    #[test]
    fn test_brief_validation_over_limit() {
        let brief = "word ".repeat(601);
        let res = BriefValidator::validate_word_count(&brief);
        assert!(res.is_err());
    }
}
