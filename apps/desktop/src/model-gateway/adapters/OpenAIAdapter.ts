import { ProviderAdapter } from './ProviderAdapter';
import { ModelProviderKind, ModelInfo, CompletionRequest, CompletionResponse } from '../types';

export class OpenAIAdapter implements ProviderAdapter {
  public kind: ModelProviderKind = 'openai';

  public isAvailable(): boolean {
    return true;
  }

  public async complete(request: CompletionRequest, model: ModelInfo): Promise<CompletionResponse> {
    const startTime = Date.now();
    const promptText = request.messages.map((m) => m.content).join(' ');
    const inputTokens = Math.max(12, Math.ceil(promptText.length / 4));
    const outputTokens = 50;

    const inputCost = (inputTokens / 1000) * model.inputCostPer1k;
    const outputCost = (outputTokens / 1000) * model.outputCostPer1k;

    return {
      id: `res_oai_${Math.random().toString(36).substring(2, 8)}`,
      modelId: model.modelId,
      provider: this.kind,
      content: `[OpenAI Response from ${model.displayName}]: Goal plan generated cleanly.`,
      inputTokens,
      outputTokens,
      latencyMs: Date.now() - startTime + 140,
      cached: false,
      costUSD: inputCost + outputCost,
      timestamp: new Date().toISOString(),
    };
  }
}
