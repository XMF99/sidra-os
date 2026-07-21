//! Sidra OS Model Service (Provider Abstraction, Adaptors, Router, Token Accounting)

pub mod accounting;
pub mod model_errors;
pub mod provider;
pub mod providers;
pub mod router;

pub use accounting::CostCalculator;
pub use model_errors::ModelError;
pub use provider::ModelProvider;
pub use providers::{
    AnthropicProvider, GeminiProvider, MockFailingProvider, MockSuccessProvider, OllamaProvider,
    OpenAIProvider, OpenRouterProvider,
};
pub use router::ModelRouter;
