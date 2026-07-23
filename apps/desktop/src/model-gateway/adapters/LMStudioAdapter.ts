import { ProviderAdapter } from './ProviderAdapter';
import { ModelProviderKind, ModelInfo, CompletionRequest, CompletionResponse } from '../types';

export class LMStudioAdapter implements ProviderAdapter {
  public kind: ModelProviderKind = 'lmstudio';

  public isAvailable(): boolean {
    return true; // Local LM Studio server default
  }

  public async complete(request: CompletionRequest, model: ModelInfo): Promise<CompletionResponse> {
    const startTime = Date.now();
    const promptText = request.messages.map((m) => m.content).join(' ');
    const inputTokens = Math.max(10, Math.ceil(promptText.length / 4));
    const outputTokens = 35;

    return {
      id: `res_lms_${Math.random().toString(36).substring(2, 8)}`,
      modelId: model.modelId,
      provider: this.kind,
      content: `[LM Studio Local Response from ${model.displayName}]: Local workstation inference complete.`,
      inputTokens,
      outputTokens,
      latencyMs: Date.now() - startTime + 90,
      cached: false,
      costUSD: 0.0,
      timestamp: new Date().toISOString(),
    };
  }
}
