use sidra_domain::{ChatMessage, CompletionRequest, ToolDefinition};
use sidra_models::{
    AnthropicProvider, GeminiProvider, MockFailingProvider, MockSuccessProvider, ModelProvider,
    ModelRouter, OllamaProvider, OpenAIProvider, OpenRouterProvider,
};
use std::sync::Arc;

#[test]
fn test_m5_exit_criterion_multi_provider_fallback_chain_failover() {
    // 1. Build a fallback chain: Primary fails, Secondary fails, Tertiary succeeds
    let provider1: Arc<dyn ModelProvider> = Arc::new(MockFailingProvider::new(
        "primary_openai",
        "Rate limit exceeded 429",
    ));
    let provider2: Arc<dyn ModelProvider> = Arc::new(MockFailingProvider::new(
        "secondary_anthropic",
        "503 Service Unavailable",
    ));
    let provider3: Arc<dyn ModelProvider> = Arc::new(MockSuccessProvider::new("tertiary_gemini"));

    let router = ModelRouter::new(vec![provider1, provider2, provider3]);

    let request = CompletionRequest {
        model: "auto".to_string(),
        messages: vec![ChatMessage {
            role: "user".to_string(),
            content: "Execute system audit search".to_string(),
            name: None,
        }],
        tools: vec![ToolDefinition {
            name: "audit_search".to_string(),
            description: "Search system audit logs".to_string(),
            parameters_json: r#"{"type":"object"}"#.to_string(),
        }],
        temperature: Some(0.7),
        max_tokens: Some(100),
    };

    // 2. Execute completion with automatic failover
    let response = router
        .complete_with_fallback(&request)
        .expect("Router MUST failover successfully to tertiary_gemini provider");

    // 3. Assert smooth failover and normalized output
    assert_eq!(
        response.provider_name, "tertiary_gemini",
        "Response MUST be produced by tertiary provider after primary and secondary failed"
    );
    assert_eq!(response.tool_calls.len(), 1);
    assert_eq!(response.tool_calls[0].name, "audit_search");
}

#[test]
fn test_coexistence_of_all_five_provider_adaptors() {
    let openai: Arc<dyn ModelProvider> = Arc::new(OpenAIProvider::new("sk-test-key"));
    let anthropic: Arc<dyn ModelProvider> = Arc::new(AnthropicProvider::new("sk-ant-test"));
    let gemini: Arc<dyn ModelProvider> = Arc::new(GeminiProvider::new("AIzaSyTest"));
    let ollama: Arc<dyn ModelProvider> = Arc::new(OllamaProvider::default());
    let openrouter: Arc<dyn ModelProvider> = Arc::new(OpenRouterProvider::new("sk-or-test"));

    let request = CompletionRequest {
        model: "auto".to_string(),
        messages: vec![ChatMessage {
            role: "user".to_string(),
            content: "Hello providers".to_string(),
            name: None,
        }],
        tools: vec![],
        temperature: Some(0.5),
        max_tokens: Some(50),
    };

    let providers = vec![openai, anthropic, gemini, ollama, openrouter];

    for provider in providers {
        let resp = provider
            .complete(&request)
            .unwrap_or_else(|_| panic!("Provider {} should succeed", provider.name()));
        assert!(!resp.content.is_empty());
        assert!(!resp.provider_name.is_empty());
    }
}
