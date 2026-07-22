use serde::{Deserialize, Serialize};
use crate::domain::input_method::InputMethod;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DirectiveSubmissionPayload {
    pub confirmed_text: String,
    pub trust_tag: String, // "principal"
    pub input_method: InputMethod,
}

impl DirectiveSubmissionPayload {
    pub fn new_confirmed_voice_directive(text: impl Into<String>) -> Self {
        Self {
            confirmed_text: text.into(),
            trust_tag: "principal".to_string(), // Voice input carries trust = principal (ADR-0052, ADR-0053)
            input_method: InputMethod::Voice,
        }
    }
}
