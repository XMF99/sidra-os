use crate::model_errors::ModelError;
use sidra_domain::{CompletionRequest, CompletionResponse};

/// Unified Model Provider Trait per ADR-0005
pub trait ModelProvider: Send + Sync {
    /// Return the canonical identifier of the provider
    fn name(&self) -> &'static str;

    /// Execute completion request normalizing response and tool calls
    fn complete(&self, request: &CompletionRequest) -> Result<CompletionResponse, ModelError>;
}
