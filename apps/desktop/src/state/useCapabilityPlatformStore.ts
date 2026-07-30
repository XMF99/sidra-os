import { create } from 'zustand';

export interface CapabilityItem {
  id: string;
  name: string;
  category: 'Capabilities' | 'Industry Workspaces' | 'Capability Packs' | 'AI Agents' | 'Workflows' | 'Templates' | 'Knowledge Packs' | 'Integrations' | 'Developer Extensions';
  description: string;
  businessValue: string;
  version: string;
  publisher: string;
  installed: boolean;
  healthStatus: 'healthy' | 'updating' | 'warning';
  estimatedSize: string;
  estimatedInstallTime: string;
  includedComponents: string[];
  permissions: string[];
}

export interface CapabilityPack {
  id: string;
  name: string;
  industry: string;
  description: string;
  icon: string;
  includedCapabilities: string[];
  installed: boolean;
}

export interface WorkspaceBlueprint {
  id: string;
  name: string;
  description: string;
  businessGoals: string[];
  businessModel: string;
  thekyConfidenceScore: number; // 0..100
  confidenceExplanation: string;
  capabilities: string[];
  agents: string[];
  workflows: string[];
  dashboards: string[];
  securityProfile: string;
  variantType: 'Minimal' | 'Recommended' | 'Professional' | 'Enterprise';
  version: string;
  sharedWith: string[];
  published: boolean;
}

interface CapabilityPlatformState {
  capabilities: CapabilityItem[];
  packs: CapabilityPack[];
  blueprints: WorkspaceBlueprint[];
  activeBlueprintId: string | null;

  // Natural Language Generation
  naturalLanguagePrompt: string;
  generatedVariants: WorkspaceBlueprint[];
  isGeneratingBlueprint: boolean;
  generateBlueprintFromPrompt: (promptText: string) => void;

  // Blueprint Lifecycle
  saveBlueprint: (blueprint: WorkspaceBlueprint) => void;
  duplicateBlueprint: (id: string) => void;
  forkBlueprint: (id: string) => void;
  shareBlueprint: (id: string, spaceId: string) => void;
  publishBlueprint: (id: string) => void;
  selectBlueprint: (id: string) => void;

  // Capability Execution Layer (Primary Action: "Generate Workspace" or "Add Capability")
  installingCapabilityId: string | null;
  installProgress: number;
  installLogs: string[];
  generateWorkspaceFromBlueprint: (blueprintId: string) => void;
  addCapability: (capabilityId: string) => void;
  removeCapability: (capabilityId: string) => void;
}

const DEFAULT_CAPABILITIES: CapabilityItem[] = [
  { id: 'cap-agent-planner', name: 'Executive Task Planner Agent', category: 'AI Agents', description: 'Decomposes high-level goals into multi-phase task DAGs.', businessValue: 'Automates project scoping and milestone planning.', version: '1.2.0', publisher: 'THEKY Core Labs', installed: true, healthStatus: 'healthy', estimatedSize: '12 MB', estimatedInstallTime: '2s', includedComponents: ['PlannerAgent', 'DAGScheduler'], permissions: ['vault:read', 'vault:write'] },
  { id: 'cap-app-devconsole', name: 'Developer & IPC Telemetry Console', category: 'Capabilities', description: 'Real-time event stream inspector and Tauri IPC debugger.', businessValue: 'Provides full visibility into system IPC and security tokens.', version: '1.0.4', publisher: 'THEKY Core Labs', installed: true, healthStatus: 'healthy', estimatedSize: '8 MB', estimatedInstallTime: '1s', includedComponents: ['DevConsoleView', 'IPCInspector'], permissions: ['system:telemetry'] },
  { id: 'cap-pack-gamestudio', name: 'Game Studio Capability Pack', category: 'Capability Packs', description: 'Complete asset pipeline, narrative AI, and render queue suite.', businessValue: 'Accelerates game design studio workflows by 10x.', version: '2.0.0', publisher: 'THEKY Studio Team', installed: false, healthStatus: 'healthy', estimatedSize: '140 MB', estimatedInstallTime: '8s', includedComponents: ['StudioManager', 'AssetGraph', 'RenderQueue'], permissions: ['vault:write', 'storage:local'] },
  { id: 'cap-pack-healthcare', name: 'Healthcare & Clinical Research Pack', category: 'Capability Packs', description: 'HIPAA-compliant research vault, trial tracker, and clinical AI.', businessValue: 'Ensures strict clinical regulatory compliance.', version: '1.5.0', publisher: 'THEKY Bio Labs', installed: false, healthStatus: 'healthy', estimatedSize: '180 MB', estimatedInstallTime: '10s', includedComponents: ['BioVault', 'ComplianceEngine', 'TrialTracker'], permissions: ['vault:encrypt', 'security:hipaa'] },
];

const DEFAULT_PACKS: CapabilityPack[] = [
  { id: 'pack-startup', name: 'Startup Growth Pack', industry: 'Technology', description: 'Complete early-stage startup stack: AI planner, pitch deck workspace, and product telemetry.', icon: 'Zap', includedCapabilities: ['cap-agent-planner', 'cap-app-devconsole'], installed: true },
  { id: 'pack-gamestudio', name: 'Game Studio Pack', industry: 'Creative', description: 'Game engines, 3D asset graph, narrative script generator, and build queue.', icon: 'Gamepad2', includedCapabilities: ['cap-pack-gamestudio'], installed: false },
  { id: 'pack-healthcare', name: 'Hospital & Biotech Pack', industry: 'Healthcare', description: 'Clinical data vault, patient privacy engine, and research trial manager.', icon: 'Activity', includedCapabilities: ['cap-pack-healthcare'], installed: false },
  { id: 'pack-legal', name: 'Legal Firm Pack', industry: 'Legal', description: 'Contract review AI, compliance audit log, and privilege document vault.', icon: 'Scale', includedCapabilities: ['cap-agent-planner'], installed: false },
];

const INITIAL_BLUEPRINT: WorkspaceBlueprint = {
  id: 'bp-primary-org',
  name: 'Sovereign Enterprise Blueprint',
  description: 'Multi-agent orchestration environment with event-sourced audit vault.',
  businessGoals: ['Automate operational task DAGs', 'Enforce Permission Broker security', 'Zero cloud data leakage'],
  businessModel: 'Enterprise B2B',
  thekyConfidenceScore: 98,
  confidenceExplanation: 'High confidence based on verified industry profile (Software/Tech) and 100% security token compliance.',
  capabilities: ['cap-agent-planner', 'cap-app-devconsole'],
  agents: ['Executive Planner Agent', 'Vault Retriever Agent'],
  workflows: ['Permission Security Audit'],
  dashboards: ['Executive Overview Dashboard'],
  securityProfile: 'Strict Local Isolation (Guest/Sovereign)',
  variantType: 'Recommended',
  version: '1.0.0',
  sharedWith: ['Engineering Space', 'Executive Board'],
  published: true,
};

export const useCapabilityPlatformStore = create<CapabilityPlatformState>((set) => ({
  capabilities: DEFAULT_CAPABILITIES,
  packs: DEFAULT_PACKS,
  blueprints: [INITIAL_BLUEPRINT],
  activeBlueprintId: 'bp-primary-org',

  naturalLanguagePrompt: '',
  generatedVariants: [],
  isGeneratingBlueprint: false,

  generateBlueprintFromPrompt: (promptText) => {
    set({ isGeneratingBlueprint: true, naturalLanguagePrompt: promptText });

    setTimeout(() => {
      const promptLower = promptText.toLowerCase();
      let title = 'Custom Enterprise Workspace';
      let packId = 'cap-agent-planner';

      if (promptLower.includes('game') || promptLower.includes('studio')) {
        title = 'Game Studio Workspace';
        packId = 'cap-pack-gamestudio';
      } else if (promptLower.includes('hospital') || promptLower.includes('health') || promptLower.includes('bio')) {
        title = 'Clinical Healthcare Workspace';
        packId = 'cap-pack-healthcare';
      } else if (promptLower.includes('legal') || promptLower.includes('law')) {
        title = 'Legal Firm Workspace';
      }

      const variants: WorkspaceBlueprint[] = [
        {
          id: `bp-gen-minimal-${Date.now()}`,
          name: `${title} (Minimal Variant)`,
          description: `Lightweight ${title} with essential capabilities.`,
          businessGoals: ['Rapid deployment', 'Minimal resource footprint'],
          businessModel: 'Flexible',
          thekyConfidenceScore: 92,
          confidenceExplanation: 'Optimal lightweight setup for single-user workspaces.',
          capabilities: ['cap-agent-planner'],
          agents: ['Executive Planner Agent'],
          workflows: ['Basic Task Manager'],
          dashboards: ['Overview Dashboard'],
          securityProfile: 'Standard',
          variantType: 'Minimal',
          version: '1.0.0',
          sharedWith: [],
          published: false,
        },
        {
          id: `bp-gen-recommended-${Date.now()}`,
          name: `${title} (Recommended Variant)`,
          description: `Full-featured ${title} optimized by THEKY AI.`,
          businessGoals: ['Multi-agent workflow automation', 'Vault event logging'],
          businessModel: 'Scalable Enterprise',
          thekyConfidenceScore: 98,
          confidenceExplanation: 'Highest overall match for your declared objectives.',
          capabilities: ['cap-agent-planner', packId],
          agents: ['Executive Planner Agent', 'Vault Retriever Agent', 'Compliance Officer'],
          workflows: ['Permission Audit', 'Automated Build Pipeline'],
          dashboards: ['Executive Dashboard', 'Telemetry Monitor'],
          securityProfile: 'Strict Sovereign',
          variantType: 'Recommended',
          version: '1.0.0',
          sharedWith: [],
          published: false,
        },
      ];

      set({
        generatedVariants: variants,
        isGeneratingBlueprint: false,
        blueprints: [...variants],
        activeBlueprintId: variants[1].id,
      });
    }, 600);
  },

  saveBlueprint: (blueprint) =>
    set((state) => ({
      blueprints: state.blueprints.some((b) => b.id === blueprint.id)
        ? state.blueprints.map((b) => (b.id === blueprint.id ? blueprint : b))
        : [...state.blueprints, blueprint],
    })),

  duplicateBlueprint: (id) =>
    set((state) => {
      const target = state.blueprints.find((b) => b.id === id);
      if (!target) return state;
      const dup: WorkspaceBlueprint = {
        ...target,
        id: `bp-${Date.now()}`,
        name: `${target.name} (Copy)`,
        version: '1.0.1',
      };
      return { blueprints: [...state.blueprints, dup], activeBlueprintId: dup.id };
    }),

  forkBlueprint: (id) =>
    set((state) => {
      const target = state.blueprints.find((b) => b.id === id);
      if (!target) return state;
      const fork: WorkspaceBlueprint = {
        ...target,
        id: `bp-fork-${Date.now()}`,
        name: `${target.name} (Forked)`,
        confidenceExplanation: `Forked from ${target.name}. Custom modifications enabled.`,
      };
      return { blueprints: [...state.blueprints, fork], activeBlueprintId: fork.id };
    }),

  shareBlueprint: (id, spaceId) =>
    set((state) => ({
      blueprints: state.blueprints.map((b) =>
        b.id === id ? { ...b, sharedWith: [...new Set([...b.sharedWith, spaceId])] } : b
      ),
    })),

  publishBlueprint: (id) =>
    set((state) => ({
      blueprints: state.blueprints.map((b) => (b.id === id ? { ...b, published: true } : b)),
    })),

  selectBlueprint: (id) => set({ activeBlueprintId: id }),

  installingCapabilityId: null,
  installProgress: 0,
  installLogs: [],

  generateWorkspaceFromBlueprint: (blueprintId) => {
    set({ installingCapabilityId: blueprintId, installProgress: 10, installLogs: ['Starting Generate Workspace execution...'] });

    const steps = [
      { p: 30, log: 'Resolving dependency graph & capability tokens...' },
      { p: 60, log: 'Initializing SQLite Vault schema & hash chain...' },
      { p: 90, log: 'Registering space navigation & team AI context...' },
      { p: 100, log: '✅ Workspace Blueprint successfully generated and operational.' },
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        set((state) => ({
          installProgress: step.p,
          installLogs: [...state.installLogs, step.log],
          installingCapabilityId: step.p === 100 ? null : state.installingCapabilityId,
        }));
      }, (idx + 1) * 400);
    });
  },

  addCapability: (capabilityId) =>
    set((state) => ({
      capabilities: state.capabilities.map((c) => (c.id === capabilityId ? { ...c, installed: true } : c)),
      packs: state.packs.map((p) =>
        p.includedCapabilities.includes(capabilityId) ? { ...p, installed: true } : p
      ),
    })),

  removeCapability: (capabilityId) =>
    set((state) => ({
      capabilities: state.capabilities.map((c) => (c.id === capabilityId ? { ...c, installed: false } : c)),
    })),
}));
