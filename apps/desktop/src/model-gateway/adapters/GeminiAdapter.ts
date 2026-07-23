import { ProviderAdapter } from './ProviderAdapter';
import { ModelProviderKind, ModelInfo, CompletionRequest, CompletionResponse } from '../types';

export class GeminiAdapter implements ProviderAdapter {
  public kind: ModelProviderKind = 'gemini';

  public isAvailable(): boolean {
    return true;
  }

  public async complete(request: CompletionRequest, model: ModelInfo): Promise<CompletionResponse> {
    const startTime = Date.now();
    const promptText = request.messages.map((m) => m.content).join(' ');
    const inputTokens = Math.max(10, Math.ceil(promptText.length / 4));
    const outputTokens = 40;

    const inputCost = (inputTokens / 1000) * model.inputCostPer1k;
    const outputCost = (outputTokens / 1000) * model.outputCostPer1k;

    return {
      id: `res_gem_${Math.random().toString(36).substring(2, 8)}`,
      modelId: model.modelId,
      provider: this.kind,
      content: `[Google Gemini Response from ${model.displayName}]: Multimodal and search context analyzed.`,
      inputTokens,
      outputTokens,
      latencyMs: Date.now() - startTime + 110,
      cached: false,
      costUSD: inputCost + outputCost,
      timestamp: new Date().toISOString(),
    };
  }
}
