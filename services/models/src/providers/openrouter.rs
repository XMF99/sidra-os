use crate::model_errors::ModelError;
use crate::provider::ModelProvider;
use serde_json::json;
use sidra_domain::{CompletionRequest, CompletionResponse, TokenUsage};
use ulid::Ulid;


pub struct OpenRouterProvider {
    pub api_key: String,
    pub default_model: String,
}

impl OpenRouterProvider {
    pub fn new(api_key: impl Into<String>) -> Self {
        Self {
            api_key: api_key.into(),
            default_model: "anthropic/claude-3.5-sonnet".to_string(),
        }
    }

    pub fn with_model(api_key: impl Into<String>, model: impl Into<String>) -> Self {
        Self {
            api_key: api_key.into(),
            default_model: model.into(),
        }
    }
}

impl ModelProvider for OpenRouterProvider {
    fn name(&self) -> &'static str {
        "openrouter"
    }

    fn complete(&self, request: &CompletionRequest) -> Result<CompletionResponse, ModelError> {
        if self.api_key.is_empty() {
            return Err(ModelError::ProviderUnavailable {
                provider: self.name().to_string(),
                reason: "OpenRouter API key is missing".to_string(),
            });
        }

        let model_id = if request.model == "auto" || request.model.is_empty() {
            &self.default_model
        } else {
            &request.model
        };

        let messages_payload: Vec<_> = request
            .messages
            .iter()
            .map(|m| {
                json!({
                    "role": m.role,
                    "content": m.content
                })
            })
            .collect();

        let payload = json!({
            "model": model_id,
            "messages": messages_payload,
            "temperature": request.temperature.unwrap_or(0.7),
            "max_tokens": request.max_tokens.unwrap_or(1000)
        });

        let response_res = ureq::post("https://openrouter.ai/api/v1/chat/completions")
            .set("Authorization", &format!("Bearer {}", self.api_key))
            .set("HTTP-Referer", "https://sidra.os")
            .set("X-Title", "THEKY OS")
            .set("Content-Type", "application/json")
            .send_json(&payload);

        let response = match response_res {
            Ok(resp) => resp,
            Err(err) => {
                return Err(ModelError::ProviderUnavailable {
                    provider: self.name().to_string(),
                    reason: format!("OpenRouter HTTP request failed: {}", err),
                });
            }
        };

        let body_json: serde_json::Value = response.into_json().map_err(|e| {
            ModelError::ProviderUnavailable {
                provider: self.name().to_string(),
                reason: format!("Failed to parse OpenRouter JSON response: {}", e),
            }
        })?;

        let content = body_json["choices"][0]["message"]["content"]
            .as_str()
            .unwrap_or("No completion content returned")
            .to_string();

        let prompt_tokens = body_json["usage"]["prompt_tokens"]
            .as_u64()
            .unwrap_or(0) as usize;
        let completion_tokens = body_json["usage"]["completion_tokens"]
            .as_u64()
            .unwrap_or(0) as usize;
        let total_tokens = body_json["usage"]["total_tokens"]
            .as_u64()
            .unwrap_or((prompt_tokens + completion_tokens) as u64) as usize;

        // OpenRouter returns total_cost or cost field in usage if available, else standard Sonnet 3.5 calculation
        let estimated_cost_usd = body_json["usage"]["total_cost"]
            .as_f64()
            .unwrap_or_else(|| (prompt_tokens as f64 * 0.000003) + (completion_tokens as f64 * 0.000015));

        let response_id = body_json["id"]
            .as_str()
            .map(|s| s.to_string())
            .unwrap_or_else(|| format!("gen-{}", Ulid::new()));

        let tool_calls = Vec::new();

        Ok(CompletionResponse {
            id: response_id,
            content,
            tool_calls,
            usage: TokenUsage {
                prompt_tokens,
                completion_tokens,
                total_tokens,
                estimated_cost_usd,
            },
            provider_name: self.name().to_string(),
        })
    }
}

