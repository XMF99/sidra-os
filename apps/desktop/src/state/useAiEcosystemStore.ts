import { create } from 'zustand';

export type ProviderId = 'openai' | 'anthropic' | 'google' | 'azure' | 'openrouter' | 'ollama' | 'local';

export interface AiProvider {
  id: ProviderId;
  name: string;
  healthStatus: 'Active' | 'Degraded' | 'Offline';
  latencyMs: number;
  costPer1kTokens: number;
  availableModels: string[];
}

export type RoutingStrategy = 'Automatic' | 'Lowest Cost' | 'Lowest Latency' | 'Highest Quality';

export interface McpServer {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  permissionScope: 'Full' | 'Restricted' | 'Sandboxed';
  status: 'Connected' | 'Disconnected';
  toolsCount: number;
}

export interface ConnectorItem {
  id: string;
  name: string;
  category: 'Developer' | 'Productivity' | 'Communication' | 'Commerce' | 'Custom API';
  authStatus: 'Authorized' | 'Pending' | 'Disconnected';
  syncStatus: 'Live' | 'Idle' | 'Error';
}

export interface PromptTemplate {
  id: string;
  title: string;
  version: string;
  templateString: string;
  variables: string[];
  approvalState: 'Approved' | 'Draft' | 'Deprecated';
}

export interface CostMetric {
  totalTokensUsed: number;
  totalCostUsd: number;
  monthlyBudgetUsd: number;
  activeOptimizationAlerts: string[];
}

interface AiEcosystemState {
  providers: AiProvider[];
  routingStrategy: RoutingStrategy;
  activeModel: string;

  mcpServers: McpServer[];
  connectors: ConnectorItem[];
  prompts: PromptTemplate[];
  costMetrics: CostMetric;

  // Actions
  setRoutingStrategy: (strategy: RoutingStrategy) => void;
  setActiveModel: (model: string) => void;
  registerMcpServer: (server: Omit<McpServer, 'id'>) => void;
  toggleConnectorAuth: (id: string) => void;
  savePromptTemplate: (prompt: Omit<PromptTemplate, 'id'>) => void;
}

const DEFAULT_PROVIDERS: AiProvider[] = [
  { id: 'openai', name: 'OpenAI Enterprise API', healthStatus: 'Active', latencyMs: 140, costPer1kTokens: 0.005, availableModels: ['gpt-4o', 'gpt-4-turbo', 'o1-preview'] },
  { id: 'anthropic', name: 'Anthropic Claude Engine', healthStatus: 'Active', latencyMs: 110, costPer1kTokens: 0.003, availableModels: ['claude-3-5-sonnet', 'claude-3-haiku', 'claude-3-opus'] },
  { id: 'google', name: 'Google Gemini Vertex AI', healthStatus: 'Active', latencyMs: 125, costPer1kTokens: 0.002, availableModels: ['gemini-1-5-pro', 'gemini-1-5-flash'] },
  { id: 'ollama', name: 'Ollama Local LLM Runner', healthStatus: 'Active', latencyMs: 35, costPer1kTokens: 0.0, availableModels: ['llama3-70b', 'mistral-large', 'codellama'] },
];

const DEFAULT_MCP_SERVERS: McpServer[] = [
  { id: 'mcp-fs', name: 'Filesystem MCP Server', version: '1.2.0', capabilities: ['read_file', 'write_file', 'list_dir'], permissionScope: 'Restricted', status: 'Connected', toolsCount: 8 },
  { id: 'mcp-git', name: 'GitHub & Git Ops MCP Server', version: '2.0.1', capabilities: ['git_commit', 'create_pr', 'fetch_issue'], permissionScope: 'Full', status: 'Connected', toolsCount: 14 },
];

const DEFAULT_CONNECTORS: ConnectorItem[] = [
  { id: 'conn-github', name: 'GitHub Enterprise', category: 'Developer', authStatus: 'Authorized', syncStatus: 'Live' },
  { id: 'conn-slack', name: 'Slack Workspace', category: 'Communication', authStatus: 'Authorized', syncStatus: 'Live' },
  { id: 'conn-gsuite', name: 'Google Workspace', category: 'Productivity', authStatus: 'Authorized', syncStatus: 'Idle' },
  { id: 'conn-jira', name: 'Atlassian Jira', category: 'Productivity', authStatus: 'Pending', syncStatus: 'Idle' },
];

const DEFAULT_PROMPTS: PromptTemplate[] = [
  { id: 'prm-01', title: 'System Executive Orchestrator Directive', version: '3.1', templateString: 'You are THEKY Executive Orchestrator. Objective: {{objective}}. Constraints: {{constraints}}.', variables: ['objective', 'constraints'], approvalState: 'Approved' },
  { id: 'prm-02', title: 'Security Token Audit Prompt', version: '1.0', templateString: 'Audit token permissions for scope {{scope}} against SHA-256 hash {{hash}}.', variables: ['scope', 'hash'], approvalState: 'Approved' },
];

const DEFAULT_COST_METRICS: CostMetric = {
  totalTokensUsed: 1420500,
  totalCostUsd: 14.85,
  monthlyBudgetUsd: 250.0,
  activeOptimizationAlerts: ['Route background sub-agent queries to local Ollama Llama 3 to reduce token costs by 45%.'],
};

export const useAiEcosystemStore = create<AiEcosystemState>((set) => ({
  providers: DEFAULT_PROVIDERS,
  routingStrategy: 'Automatic',
  activeModel: 'claude-3-5-sonnet',

  mcpServers: DEFAULT_MCP_SERVERS,
  connectors: DEFAULT_CONNECTORS,
  prompts: DEFAULT_PROMPTS,
  costMetrics: DEFAULT_COST_METRICS,

  setRoutingStrategy: (strategy) => set({ routingStrategy: strategy }),

  setActiveModel: (model) => set({ activeModel: model }),

  registerMcpServer: (server) =>
    set((state) => ({
      mcpServers: [{ id: `mcp-${Date.now()}`, ...server }, ...state.mcpServers],
    })),

  toggleConnectorAuth: (id) =>
    set((state) => ({
      connectors: state.connectors.map((c) =>
        c.id === id
          ? {
              ...c,
              authStatus: c.authStatus === 'Authorized' ? 'Disconnected' : 'Authorized',
              syncStatus: c.authStatus === 'Authorized' ? 'Idle' : 'Live',
            }
          : c
      ),
    })),

  savePromptTemplate: (prompt) =>
    set((state) => ({
      prompts: [{ id: `prm-${Date.now()}`, ...prompt }, ...state.prompts],
    })),
}));
