import { UsageRecord, CompletionResponse, CompletionRequest } from './types';

export class UsageTracker {
  private records: UsageRecord[] = [];

  public recordUsage(request: CompletionRequest, response: CompletionResponse): UsageRecord {
    const record: UsageRecord = {
      id: `usg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      agentId: request.agentId,
      missionId: request.missionId,
      modelId: response.modelId,
      provider: response.provider,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      cachedTokens: response.cachedTokens,
      reasoningTokens: response.reasoningTokens,
      latencyMs: response.latencyMs,
      timestamp: new Date().toISOString(),
    };
    this.records.push(record);
    return record;
  }

  public getRecords(): UsageRecord[] {
    return [...this.records];
  }
}
