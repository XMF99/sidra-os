import { ProviderRegistry } from './ProviderRegistry';
import { ModelRegistry } from './ModelRegistry';
import { ModelInfo, CompletionRequest, CompletionResponse } from './types';

export class RetryPolicy {
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
      const adapter = providerRegistry.getAdapter(model.provider);
      if (adapter && adapter.isAvailable()) {
        try {
          const response = await adapter.complete(request, model);
          return { response, selectedModel: model };
        } catch (err) {
          console.warn(`[RetryPolicy] Adapter '${model.provider}' failed for model '${model.modelId}':`, err);
        }
      }
    }

    throw new Error('All AI provider adapters failed or were unavailable during fallback cascade.');
  }
}
