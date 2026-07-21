use crate::model_errors::ModelError;
use crate::provider::ModelProvider;
use sidra_domain::{CompletionRequest, CompletionResponse};
use std::sync::Arc;

pub struct ModelRouter {
    fallback_chain: Vec<Arc<dyn ModelProvider>>,
}

impl ModelRouter {
    pub fn new(fallback_chain: Vec<Arc<dyn ModelProvider>>) -> Self {
        Self { fallback_chain }
    }

    /// Execute completion with automatic fallback provider failover
    pub fn complete_with_fallback(
        &self,
        request: &CompletionRequest,
    ) -> Result<CompletionResponse, ModelError> {
        if self.fallback_chain.is_empty() {
            return Err(ModelError::FallbackChainExhausted {
                total_providers: 0,
                last_error: "No model providers registered in router fallback chain".to_string(),
            });
        }

        let mut last_error_msg = String::new();

        for (index, provider) in self.fallback_chain.iter().enumerate() {
            match provider.complete(request) {
                Ok(response) => {
                    return Ok(response);
                }
                Err(err) => {
                    last_error_msg = format!("Provider [{}] failed (step {}/{}): {}", provider.name(), index + 1, self.fallback_chain.len(), err);
                }
            }
        }

        Err(ModelError::FallbackChainExhausted {
            total_providers: self.fallback_chain.len(),
            last_error: last_error_msg,
        })
    }
}
