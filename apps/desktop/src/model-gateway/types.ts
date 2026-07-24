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

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface ToolCallRequest {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface CompletionRequest {
  agentId: string;
  missionId?: string;
  promptId?: string;
  templateVariables?: Record<string, string>;
  messages: MessagePrompt[];
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stopSequences?: string[];
  tools?: ToolDefinition[];
  responseFormat?: 'text' | 'json_object';
  categoryHint?: 'coding' | 'documentation' | 'reasoning' | 'vision' | 'translation' | 'search' | string;
  bypassCache?: boolean;
  onStreamChunk?: (chunk: string) => void;
}

export interface CompletionResponse {
  id: string;
  modelId: string;
  provider: ModelProviderKind;
  content: string;
  toolCalls?: ToolCallRequest[];
  inputTokens: number;
  outputTokens: number;
  cachedTokens?: number;
  reasoningTokens?: number;
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
  cachedTokens?: number;
  reasoningTokens?: number;
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
    | 'CostRecorded'
    | 'ModelRequestStarted'
    | 'ModelRequestCompleted'
    | 'ModelRequestFailed'
    | 'ModelStreamStarted'
    | 'ModelStreamChunk'
    | 'ModelStreamFinished'
    | 'ToolRequested'
    | 'ToolCompleted';
  timestamp: string;
  payload: Record<string, unknown>;
}
