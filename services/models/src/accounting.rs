use sidra_domain::TokenUsage;

pub struct CostCalculator;

impl CostCalculator {
    /// Calculate estimated USD cost based on provider pricing tables
    pub fn calculate_cost(
        provider_name: &str,
        prompt_tokens: usize,
        completion_tokens: usize,
    ) -> TokenUsage {
        let (prompt_rate, completion_rate) = match provider_name {
            "openai" => (0.000005, 0.000015),
            "anthropic" => (0.000003, 0.000015),
            "gemini" => (0.00000125, 0.000005),
            "openrouter" => (0.000002, 0.000010),
            "ollama" => (0.0, 0.0), // Local free execution
            _ => (0.000002, 0.000010),
        };

        let total_tokens = prompt_tokens + completion_tokens;
        let estimated_cost_usd =
            (prompt_tokens as f64 * prompt_rate) + (completion_tokens as f64 * completion_rate);

        TokenUsage {
            prompt_tokens,
            completion_tokens,
            total_tokens,
            estimated_cost_usd,
        }
    }
}
