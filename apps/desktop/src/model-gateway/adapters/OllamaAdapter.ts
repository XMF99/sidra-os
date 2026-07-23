import { ProviderAdapter } from './ProviderAdapter';
import { ModelProviderKind, ModelInfo, CompletionRequest, CompletionResponse } from '../types';

export class OllamaAdapter implements ProviderAdapter {
  public kind: ModelProviderKind = 'ollama';

  public isAvailable(): boolean {
    return true; // Local server default
  }

  public async complete(request: CompletionRequest, model: ModelInfo): Promise<CompletionResponse> {
    const startTime = Date.now();
    const promptText = request.messages.map((m) => m.content).join(' ');
    const inputTokens = Math.max(10, Math.ceil(promptText.length / 4));
    const outputTokens = 35;

    return {
      id: `res_oll_${Math.random().toString(36).substring(2, 8)}`,
      modelId: model.modelId,
      provider: this.kind,
      content: `[Ollama Local Response from ${model.displayName}]: Local inference complete.`,
      inputTokens,
      outputTokens,
      latencyMs: Date.now() - startTime + 80,
      cached: false,
      costUSD: 0.0, // Zero cost for local offline model
      timestamp: new Date().toISOString(),
    };
  }
}
