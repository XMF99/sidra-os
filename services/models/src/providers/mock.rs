use crate::model_errors::ModelError;
use crate::provider::ModelProvider;
use sidra_domain::{CompletionRequest, CompletionResponse, TokenUsage, ToolCall};
use ulid::Ulid;

pub struct MockFailingProvider {
    pub provider_name: &'static str,
    pub failure_reason: String,
}

impl MockFailingProvider {
    pub fn new(name: &'static str, reason: impl Into<String>) -> Self {
        Self {
            provider_name: name,
            failure_reason: reason.into(),
        }
    }
}

impl ModelProvider for MockFailingProvider {
    fn name(&self) -> &'static str {
        self.provider_name
    }

    fn complete(&self, _request: &CompletionRequest) -> Result<CompletionResponse, ModelError> {
        Err(ModelError::ProviderUnavailable {
            provider: self.provider_name.to_string(),
            reason: self.failure_reason.clone(),
        })
    }
}

pub struct MockSuccessProvider {
    pub provider_name: &'static str,
}

impl MockSuccessProvider {
    pub fn new(name: &'static str) -> Self {
        Self { provider_name: name }
    }
}

impl ModelProvider for MockSuccessProvider {
    fn name(&self) -> &'static str {
        self.provider_name
    }

    fn complete(&self, request: &CompletionRequest) -> Result<CompletionResponse, ModelError> {
        let tool_calls = request
            .tools
            .first()
            .map(|t| vec![ToolCall {
                id: format!("call_mock_{}", Ulid::new()),
                name: t.name.clone(),
                arguments_json: r#"{"status":"success_fallback"}"#.to_string(),
            }])
            .unwrap_or_default();

        Ok(CompletionResponse {
            id: format!("mock-{}", Ulid::new()),
            content: format!("Response from mock success provider [{}]", self.provider_name),
            tool_calls,
            usage: TokenUsage {
                prompt_tokens: 10,
                completion_tokens: 15,
                total_tokens: 25,
                estimated_cost_usd: 0.0001,
            },
            provider_name: self.provider_name.to_string(),
        })
    }
}
