import { ProviderAdapter } from './ProviderAdapter';
import { ModelProviderKind, ModelInfo, CompletionRequest, CompletionResponse } from '../types';

export class AnthropicAdapter implements ProviderAdapter {
  public kind: ModelProviderKind = 'anthropic';

  public isAvailable(): boolean {
    return true;
  }

  public async complete(request: CompletionRequest, model: ModelInfo): Promise<CompletionResponse> {
    const startTime = Date.now();
    const promptText = request.messages.map((m) => m.content).join(' ');
    const inputTokens = Math.max(15, Math.ceil(promptText.length / 4));
    const outputTokens = 60;

    const inputCost = (inputTokens / 1000) * model.inputCostPer1k;
    const outputCost = (outputTokens / 1000) * model.outputCostPer1k;

    return {
      id: `res_ant_${Math.random().toString(36).substring(2, 8)}`,
      modelId: model.modelId,
      provider: this.kind,
      content: `[Anthropic Response from ${model.displayName}]: Detailed reasoning and structural compliance verified.`,
      inputTokens,
      outputTokens,
      latencyMs: Date.now() - startTime + 160,
      cached: false,
      costUSD: inputCost + outputCost,
      timestamp: new Date().toISOString(),
    };
  }
}
