import { CostRecord, CompletionResponse, CompletionRequest } from './types';

export class CostTracker {
  private records: CostRecord[] = [];

  public recordCost(request: CompletionRequest, response: CompletionResponse): CostRecord {
    const record: CostRecord = {
      id: `cst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      agentId: request.agentId,
      missionId: request.missionId,
      modelId: response.modelId,
      provider: response.provider,
      inputCostUSD: response.costUSD * 0.4,
      outputCostUSD: response.costUSD * 0.6,
      totalCostUSD: response.costUSD,
      timestamp: new Date().toISOString(),
    };
    this.records.push(record);
    return record;
  }

  public getTotalCost(): number {
    return this.records.reduce((acc, r) => acc + r.totalCostUSD, 0);
  }

  public getCostByAgent(agentId: string): number {
    return this.records
      .filter((r) => r.agentId === agentId)
      .reduce((acc, r) => acc + r.totalCostUSD, 0);
  }

  public getRecords(): CostRecord[] {
    return [...this.records];
  }
}
