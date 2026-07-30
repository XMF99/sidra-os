import { create } from 'zustand';

export type LifecycleState = 'Draft' | 'Testing' | 'Approved' | 'Published' | 'Deprecated' | 'Archived';

export interface BusinessCapability {
  id: string;
  name: string;
  version: string;
  category: 'Engineering' | 'Marketing' | 'Operations' | 'Finance' | 'Customer Support' | 'Legal';
  owner: string;
  description: string;
  lifecycleState: LifecycleState;
  composedModels: string[];
  composedTools: string[];
  composedConnectors: string[];
  dependencies: string[];
  permissionsRequired: string[];
  executionCount: number;
  successRate: number; // 0..100
}

export interface CapabilityTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  recommendedModels: string[];
  recommendedConnectors: string[];
}

export interface DependencyGraphNode {
  id: string;
  name: string;
  version: string;
  dependsOn: string[];
  hasConflict: boolean;
}

interface CapabilityIntelligenceState {
  capabilities: BusinessCapability[];
  templates: CapabilityTemplate[];
  dependencyNodes: DependencyGraphNode[];

  searchQuery: string;
  selectedCategoryFilter: string;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategoryFilter: (category: string) => void;
  updateLifecycleState: (id: string, newState: LifecycleState) => void;
  createCapabilityFromTemplate: (templateId: string) => void;
  registerCapability: (cap: Omit<BusinessCapability, 'id' | 'executionCount' | 'successRate'>) => void;
}

const DEFAULT_CAPABILITIES: BusinessCapability[] = [
  {
    id: 'cap-gamedev',
    name: 'Game Studio Master Pipeline',
    version: '2.1.0',
    category: 'Engineering',
    owner: 'Principal Architect',
    description: 'Unified capability orchestrating asset generation, Rust engine compilation, and automated Playwright E2E testing.',
    lifecycleState: 'Published',
    composedModels: ['claude-3-5-sonnet', 'gpt-4o'],
    composedTools: ['mcp-fs', 'mcp-git'],
    composedConnectors: ['GitHub Enterprise'],
    dependencies: [],
    permissionsRequired: ['fs:read_write', 'git:commit_pr'],
    executionCount: 142,
    successRate: 99.2,
  },
  {
    id: 'cap-invoice',
    name: 'Automated Invoice Processing',
    version: '1.0.0',
    category: 'Finance',
    owner: 'Finance Director',
    description: 'Composed capability extracting line items from receipts, verifying Vault hashes, and syncing with Stripe.',
    lifecycleState: 'Published',
    composedModels: ['gpt-4o'],
    composedTools: ['mcp-fs'],
    composedConnectors: ['Stripe Workspace'],
    dependencies: [],
    permissionsRequired: ['stripe:read_write', 'vault:audit_hash'],
    executionCount: 89,
    successRate: 97.5,
  },
  {
    id: 'cap-mktg',
    name: 'Omni-Channel Marketing Campaign',
    version: '1.2.0',
    category: 'Marketing',
    owner: 'CMO Lead',
    description: 'Generates campaign copy, creates social graphics, and dispatches updates across Slack and email.',
    lifecycleState: 'Testing',
    composedModels: ['gemini-1-5-pro'],
    composedTools: ['mcp-fs'],
    composedConnectors: ['Slack Workspace', 'Google Workspace'],
    dependencies: ['cap-invoice'],
    permissionsRequired: ['slack:post_message', 'gsuite:drive'],
    executionCount: 12,
    successRate: 91.6,
  },
];

const DEFAULT_TEMPLATES: CapabilityTemplate[] = [
  {
    id: 'tmpl-game',
    title: 'Game Development Pipeline Template',
    category: 'Engineering',
    description: 'Pre-configured capability combining Claude 3.5 Sonnet, GitHub connector, and Rust build tools.',
    recommendedModels: ['claude-3-5-sonnet'],
    recommendedConnectors: ['GitHub Enterprise'],
  },
  {
    id: 'tmpl-support',
    title: 'Customer Support Assistant Template',
    category: 'Customer Support',
    description: 'Pre-configured capability linking Knowledge Graph traversal with Slack workspace bot.',
    recommendedModels: ['gpt-4o'],
    recommendedConnectors: ['Slack Workspace'],
  },
];

const DEFAULT_GRAPH_NODES: DependencyGraphNode[] = [
  { id: 'cap-gamedev', name: 'Game Studio Master Pipeline', version: '2.1.0', dependsOn: [], hasConflict: false },
  { id: 'cap-invoice', name: 'Automated Invoice Processing', version: '1.0.0', dependsOn: [], hasConflict: false },
  { id: 'cap-mktg', name: 'Omni-Channel Marketing Campaign', version: '1.2.0', dependsOn: ['cap-invoice'], hasConflict: false },
];

export const useCapabilityIntelligenceStore = create<CapabilityIntelligenceState>((set) => ({
  capabilities: DEFAULT_CAPABILITIES,
  templates: DEFAULT_TEMPLATES,
  dependencyNodes: DEFAULT_GRAPH_NODES,

  searchQuery: '',
  selectedCategoryFilter: 'All',

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedCategoryFilter: (category) => set({ selectedCategoryFilter: category }),

  updateLifecycleState: (id, newState) =>
    set((state) => ({
      capabilities: state.capabilities.map((c) => (c.id === id ? { ...c, lifecycleState: newState } : c)),
    })),

  createCapabilityFromTemplate: (templateId) =>
    set((state) => {
      const tmpl = state.templates.find((t) => t.id === templateId);
      if (!tmpl) return state;

      const newCap: BusinessCapability = {
        id: `cap-${Date.now()}`,
        name: tmpl.title.replace(' Template', ''),
        version: '1.0.0',
        category: tmpl.category as BusinessCapability['category'],
        owner: 'System Architect',
        description: tmpl.description,
        lifecycleState: 'Draft',
        composedModels: tmpl.recommendedModels,
        composedTools: ['mcp-fs'],
        composedConnectors: tmpl.recommendedConnectors,
        dependencies: [],
        permissionsRequired: ['basic_access'],
        executionCount: 0,
        successRate: 100,
      };

      return {
        capabilities: [newCap, ...state.capabilities],
        dependencyNodes: [
          { id: newCap.id, name: newCap.name, version: newCap.version, dependsOn: [], hasConflict: false },
          ...state.dependencyNodes,
        ],
      };
    }),

  registerCapability: (cap) =>
    set((state) => ({
      capabilities: [
        { id: `cap-${Date.now()}`, executionCount: 0, successRate: 100, ...cap },
        ...state.capabilities,
      ],
    })),
}));
