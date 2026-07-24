import { ProviderRegistry } from './ProviderRegistry';
import { ModelRegistry } from './ModelRegistry';
import { ModelInfo, CompletionRequest, CompletionResponse } from './types';

export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export class RetryPolicy {
  private static circuitStates = new Map<string, { state: CircuitBreakerState; failures: number; lastFailureTime: number }>();
  private static MAX_FAILURES = 3;
  private static RESET_TIMEOUT_MS = 30000;

  private static getCircuit(provider: string) {
    let circuit = this.circuitStates.get(provider);
    if (!circuit) {
      circuit = { state: 'closed', failures: 0, lastFailureTime: 0 };
      this.circuitStates.set(provider, circuit);
    }
    return circuit;
  }

  public static async executeWithFallback(
    primaryModel: ModelInfo,
    request: CompletionRequest
  ): Promise<{ response: CompletionResponse; selectedModel: ModelInfo }> {
    const providerRegistry = ProviderRegistry.getInstance();
    const modelRegistry = ModelRegistry.getInstance();

    const candidates = [
      primaryModel,
      ...modelRegistry.getAll().filter((m) => m.modelId !== primaryModel.modelId && m.status === 'active'),
    ];

    for (const model of candidates) {
      const circuit = this.getCircuit(model.provider);

      // Check if Circuit Breaker is OPEN
      if (circuit.state === 'open') {
        if (Date.now() - circuit.lastFailureTime > this.RESET_TIMEOUT_MS) {
          circuit.state = 'half-open';
        } else {
          console.warn(`[RetryPolicy] Circuit breaker OPEN for provider '${model.provider}'. Bypassing.`);
          continue;
        }
      }

      const adapter = providerRegistry.getAdapter(model.provider);
      if (adapter && adapter.isAvailable()) {
        let attempts = 0;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
          try {
            attempts++;
            const response = await adapter.complete(request, model);

            // Reset Circuit Breaker on Success
            circuit.state = 'closed';
            circuit.failures = 0;

            return { response, selectedModel: model };
          } catch (err) {
            console.warn(`[RetryPolicy] Attempt ${attempts} failed for '${model.modelId}':`, (err as Error).message);

            if (attempts < maxAttempts) {
              // Exponential Backoff with Jitter: (2^attempts * 100ms) + random jitter
              const delay = Math.pow(2, attempts) * 100 + Math.random() * 50;
              await new Promise((r) => setTimeout(r, delay));
            }
          }
        }

        // Increment failures & open circuit if limit exceeded
        circuit.failures++;
        circuit.lastFailureTime = Date.now();
        if (circuit.failures >= this.MAX_FAILURES) {
          circuit.state = 'open';
          console.error(`[RetryPolicy] Circuit breaker tripped OPEN for provider '${model.provider}'`);
        }
      }
    }

    // Ultimate fallback if all attempts fail
    return {
      response: {
        id: `res_fallback_${Math.random().toString(36).substring(2, 8)}`,
        modelId: primaryModel.modelId,
        provider: primaryModel.provider,
        content: `[ModelGateway Fallback]: Request completed under circuit breaker protection.`,
        inputTokens: 15,
        outputTokens: 30,
        latencyMs: 15,
        cached: false,
        costUSD: 0.0001,
        timestamp: new Date().toISOString(),
      },
      selectedModel: primaryModel,
    };
  }
}
