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
    this.emitEvent('ModelRequestStarted', { agentId: request.agentId, missionId: request.missionId });

    // 1. Template Resolution
    let messages = request.messages;
    if (request.promptId) {
      messages = this.templateRegistry.render(
        request.promptId,
        request.templateVariables || {}
      );
    }
    const fullRequest = { ...request, messages };

    this.emitEvent('PromptSent', { agentId: request.agentId, missionId: request.missionId });

    // 2. Cache Lookup
    const cacheKey = this.cache.hashPrompt(fullRequest);
    if (!request.bypassCache) {
      const cachedResponse = this.cache.get(cacheKey);
      if (cachedResponse) {
        this.emitEvent('CacheHit', { cacheKey });
        this.emitEvent('ModelRequestCompleted', { cached: true });
        return cachedResponse;
      }
    }
    this.emitEvent('CacheMiss', { cacheKey });

    // 3. Model Routing
    const primaryModel: ModelInfo = this.routingEngine.selectModel(request.categoryHint);
    this.emitEvent('ModelSelected', { modelId: primaryModel.modelId, provider: primaryModel.provider });

    if (request.onStreamChunk) {
      this.emitEvent('ModelStreamStarted', { modelId: primaryModel.modelId });
    }

    try {
      // 4. Execution via RetryPolicy with Fallback & Circuit Breaker
      const { response, selectedModel } = await RetryPolicy.executeWithFallback(
        primaryModel,
        fullRequest
      );

      if (request.onStreamChunk) {
        this.emitEvent('ModelStreamFinished', { modelId: selectedModel.modelId });
      }

      if (response.toolCalls && response.toolCalls.length > 0) {
        this.emitEvent('ToolRequested', { toolCount: response.toolCalls.length, tools: response.toolCalls.map((t) => t.name) });
      }

      // 5. Cache Store
      if (!request.bypassCache) {
        this.cache.set(cacheKey, response);
      }

      // 6. Usage & Cost Accounting
      const usage = this.usageTracker.recordUsage(fullRequest, response);
      const cost = this.costTracker.recordCost(fullRequest, response);

      this.emitEvent('UsageRecorded', { usageId: usage.id, tokens: response.inputTokens + response.outputTokens });
      this.emitEvent('CostRecorded', { costId: cost.id, costUSD: response.costUSD });
      this.emitEvent('ResponseReceived', { modelId: selectedModel.modelId, latencyMs: response.latencyMs });
      this.emitEvent('ModelRequestCompleted', { modelId: selectedModel.modelId, costUSD: response.costUSD });

      return response;
    } catch (err) {
      this.emitEvent('ModelRequestFailed', { error: (err as Error).message });
      throw err;
    }
  }

  public getUsageTracker(): UsageTracker {
    return this.usageTracker;
  }

  public getCostTracker(): CostTracker {
    return this.costTracker;
  }
}
