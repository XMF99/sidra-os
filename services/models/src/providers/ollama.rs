use crate::model_errors::ModelError;
use crate::provider::ModelProvider;
use sidra_domain::{CompletionRequest, CompletionResponse};


pub struct OllamaProvider {
    pub endpoint: String,
}

impl OllamaProvider {
    pub fn new(endpoint: impl Into<String>) -> Self {
        Self {
            endpoint: endpoint.into(),
        }
    }
}

impl Default for OllamaProvider {
    fn default() -> Self {
        Self::new("http://localhost:11434")
    }
}

impl ModelProvider for OllamaProvider {
    fn name(&self) -> &'static str {
        "ollama"
    }

    fn complete(&self, _request: &CompletionRequest) -> Result<CompletionResponse, ModelError> {
        Err(ModelError::ProviderUnavailable {
            provider: self.name().to_string(),
            reason: "Local Ollama provider disabled; deferred to future fully-local milestone".to_string(),
        })
    }

}
