export type ModelProviderKind =
  | 'openrouter'
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'ollama'
  | 'lmstudio';

export interface ModelInfo {
  modelId: string;
  provider: ModelProviderKind;
  displayName: string;
  contextWindow: number;
  inputCostPer1k: number;
  outputCostPer1k: number;
  supportsVision: boolean;
  supportsImages: boolean;
  supportsAudio: boolean;
  supportsTools: boolean;
  supportsJsonMode: boolean;
  supportsStreaming: boolean;
  priority: number;
  status: 'active' | 'degraded' | 'disabled';
  metadata: Record<string, unknown>;
}

export interface MessagePrompt {
  role: 'system' | 'developer' | 'user' | 'assistant';
  content: string;
}

export interface CompletionRequest {
  agentId: string;
  missionId?: string;
  promptId?: string;
  templateVariables?: Record<string, string>;
  messages: MessagePrompt[];
  temperature?: number;
  maxTokens?: number;
  categoryHint?: 'coding' | 'documentation' | 'reasoning' | 'vision' | 'translation' | 'search' | string;
  bypassCache?: boolean;
}

export interface CompletionResponse {
  id: string;
  modelId: string;
  provider: ModelProviderKind;
  content: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  cached: boolean;
  costUSD: number;
  timestamp: string;
}

export interface UsageRecord {
  id: string;
  agentId: string;
  missionId?: string;
  modelId: string;
  provider: ModelProviderKind;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  timestamp: string;
}

export interface CostRecord {
  id: string;
  agentId: string;
  missionId?: string;
  modelId: string;
  provider: ModelProviderKind;
  inputCostUSD: number;
  outputCostUSD: number;
  totalCostUSD: number;
  timestamp: string;
}

export interface PromptTemplate {
  id: string;
  version: string;
  systemMessage?: string;
  developerMessage?: string;
  userMessageTemplate: string;
  variables: string[];
}

export interface GatewayEvent {
  id: string;
  type:
    | 'PromptSent'
    | 'ResponseReceived'
    | 'ModelSelected'
    | 'ProviderFailed'
    | 'ProviderRecovered'
    | 'CacheHit'
    | 'CacheMiss'
    | 'UsageRecorded'
    | 'CostRecorded';
  timestamp: string;
  payload: Record<string, unknown>;
}
