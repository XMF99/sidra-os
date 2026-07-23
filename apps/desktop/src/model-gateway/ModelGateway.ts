import {
  CompletionRequest,
  CompletionResponse,
  GatewayEvent,
  ModelInfo,
} from './types';
import { RoutingEngine } from './RoutingEngine';
import { PromptTemplateRegistry } from './PromptTemplateRegistry';
import { ResponseCache } from './ResponseCache';
import { RetryPolicy } from './RetryPolicy';
import { UsageTracker } from './UsageTracker';
import { CostTracker } from './CostTracker';

export type GatewayEventListener = (event: GatewayEvent) => void;

export class ModelGateway {
  private static instance: ModelGateway;
  private routingEngine = RoutingEngine.getInstance();
  private templateRegistry = PromptTemplateRegistry.getInstance();
  private cache = ResponseCache.getInstance();
  private usageTracker = new UsageTracker();
  private costTracker = new CostTracker();
  private listeners = new Set<GatewayEventListener>();
  private eventLog: GatewayEvent[] = [];

  public static getInstance(): ModelGateway {
    if (!ModelGateway.instance) {
      ModelGateway.instance = new ModelGateway();
    }
    return ModelGateway.instance;
  }

  public subscribe(listener: GatewayEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(type: GatewayEvent['type'], payload: Record<string, unknown>): void {
    const event: GatewayEvent = {
      id: `EV-GW-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): GatewayEvent[] {
    return [...this.eventLog];
  }

  public async complete(request: CompletionRequest): Promise<CompletionResponse> {
    // 1. Template Resolution if promptId is provided
    let messages = request.messages;
    if (request.promptId) {
      messages = this.templateRegistry.render(
        request.promptId,
        request.templateVariables || {}
      );
    }

    this.emitEvent('PromptSent', { agentId: request.agentId, missionId: request.missionId });

    // 2. Cache Lookup
    const cacheKey = this.cache.hashPrompt(messages);
    if (!request.bypassCache) {
      const cachedResponse = this.cache.get(cacheKey);
      if (cachedResponse) {
        this.emitEvent('CacheHit', { cacheKey });
        return cachedResponse;
      }
    }
    this.emitEvent('CacheMiss', { cacheKey });

    // 3. Routing Engine Selection
    const primaryModel: ModelInfo = this.routingEngine.selectModel(request.categoryHint);
    this.emitEvent('ModelSelected', { modelId: primaryModel.modelId, provider: primaryModel.provider });

    // 4. Provider Execution with Fallback Cascade
    const { response, selectedModel } = await RetryPolicy.executeWithFallback(
      primaryModel,
      { ...request, messages }
    );

    // 5. Cache Store
    if (!request.bypassCache) {
      this.cache.set(cacheKey, response);
    }

    // 6. Usage & Cost Tracking
    const usage = this.usageTracker.recordUsage(request, response);
    const cost = this.costTracker.recordCost(request, response);

    this.emitEvent('UsageRecorded', { usageId: usage.id, tokens: response.inputTokens + response.outputTokens });
    this.emitEvent('CostRecorded', { costId: cost.id, costUSD: response.costUSD });
    this.emitEvent('ResponseReceived', { modelId: selectedModel.modelId, latencyMs: response.latencyMs });

    return response;
  }

  public getUsageTracker(): UsageTracker {
    return this.usageTracker;
  }

  public getCostTracker(): CostTracker {
    return this.costTracker;
  }
}
