use thiserror::Error;

#[derive(Error, Debug)]
pub enum ModelError {
    #[error("Provider Unavailable: Provider '{provider}' failed with error: {reason}")]
    ProviderUnavailable { provider: String, reason: String },

    #[error("Rate Limit Exceeded: Provider '{provider}' rate limited request")]
    RateLimitExceeded { provider: String },

    #[error("Invalid Request: {0}")]
    InvalidRequest(String),

    #[error("Tool Call Serialization/Deserialization Error: {0}")]
    ToolCallError(String),

    #[error("Fallback Chain Exhausted: All {total_providers} providers in fallback chain failed. Last error: {last_error}")]
    FallbackChainExhausted {
        total_providers: usize,
        last_error: String,
    },
}
