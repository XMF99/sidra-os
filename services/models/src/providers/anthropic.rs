use crate::model_errors::ModelError;
use crate::provider::ModelProvider;
use sidra_domain::{CompletionRequest, CompletionResponse};


pub struct AnthropicProvider {
    pub api_key: String,
}

impl AnthropicProvider {
    pub fn new(api_key: impl Into<String>) -> Self {
        Self {
            api_key: api_key.into(),
        }
    }
}

impl ModelProvider for AnthropicProvider {
    fn name(&self) -> &'static str {
        "anthropic"
    }

    fn complete(&self, _request: &CompletionRequest) -> Result<CompletionResponse, ModelError> {
        Err(ModelError::ProviderUnavailable {
            provider: self.name().to_string(),
            reason: "Direct Anthropic provider disabled; use OpenRouter provider".to_string(),
        })
    }

}
