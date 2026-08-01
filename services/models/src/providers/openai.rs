use crate::model_errors::ModelError;
use crate::provider::ModelProvider;
use sidra_domain::{CompletionRequest, CompletionResponse};


pub struct OpenAIProvider {
    pub api_key: String,
}

impl OpenAIProvider {
    pub fn new(api_key: impl Into<String>) -> Self {
        Self {
            api_key: api_key.into(),
        }
    }
}

impl ModelProvider for OpenAIProvider {
    fn name(&self) -> &'static str {
        "openai"
    }

    fn complete(&self, _request: &CompletionRequest) -> Result<CompletionResponse, ModelError> {
        Err(ModelError::ProviderUnavailable {
            provider: self.name().to_string(),
            reason: "Direct OpenAI provider disabled; use OpenRouter provider".to_string(),
        })
    }

}
