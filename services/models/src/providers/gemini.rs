use crate::model_errors::ModelError;
use crate::provider::ModelProvider;
use sidra_domain::{CompletionRequest, CompletionResponse};


pub struct GeminiProvider {
    pub api_key: String,
}

impl GeminiProvider {
    pub fn new(api_key: impl Into<String>) -> Self {
        Self {
            api_key: api_key.into(),
        }
    }
}

impl ModelProvider for GeminiProvider {
    fn name(&self) -> &'static str {
        "gemini"
    }

    fn complete(&self, _request: &CompletionRequest) -> Result<CompletionResponse, ModelError> {
        Err(ModelError::ProviderUnavailable {
            provider: self.name().to_string(),
            reason: "Direct Gemini provider disabled; use OpenRouter provider".to_string(),
        })
    }

}
