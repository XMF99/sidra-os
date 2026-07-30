import { create } from 'zustand';

export type SolutionLifecycleState = 'Draft' | 'Review' | 'Testing' | 'Approved' | 'Published' | 'Deprecated' | 'Archived';

export interface BusinessSolution {
  id: string;
  name: string;
  version: string;
  domain: 'Game Studio' | 'Enterprise ERP' | 'CRM & Sales' | 'HR & Workforce' | 'Finance & Accounting' | 'Software Company';
  owner: string;
  description: string;
  lifecycleState: SolutionLifecycleState;
  includedCapabilityIds: string[];
  requiredConnectors: string[];
  securityProfile: 'High Security' | 'Standard Enterprise' | 'Sandbox';
  roiEstimateRatio: number; // e.g. 4.2 = 4.2x ROI
  automationLevelPercent: number; // 0..100
  timeSavingsHoursPerWeek: number;
}

export interface EnterpriseBlueprint {
  id: string;
  solutionId: string;
  title: string;
  departments: string[];
  roles: string[];
  executionFlowDag: string[];
  complianceMandates: string[];
  generatedAt: string;
}

export interface SolutionTemplate {
  id: string;
  title: string;
  domain: string;
  description: string;
  defaultCapabilities: string[];
  expectedAutomationPercent: number;
}

interface BusinessSolutionState {
  solutions: BusinessSolution[];
  blueprints: EnterpriseBlueprint[];
  templates: SolutionTemplate[];

  activeSolutionId: string;

  // Actions
  updateSolutionLifecycle: (id: string, newState: SolutionLifecycleState) => void;
  generateBlueprint: (solutionId: string) => EnterpriseBlueprint;
  instantiateSolutionFromTemplate: (templateId: string) => void;
  registerSolution: (sol: Omit<BusinessSolution, 'id' | 'roiEstimateRatio' | 'automationLevelPercent' | 'timeSavingsHoursPerWeek'>) => void;
}

const DEFAULT_SOLUTIONS: BusinessSolution[] = [
  {
    id: 'sol-gamestudio',
    name: 'Game Studio Operating Solution',
    version: '1.0.0',
    domain: 'Game Studio',
    owner: 'Chief Executive Architect',
    description: 'End-to-end game studio business solution uniting Asset Generation, Rust compilation, E2E QA certification, and Revenue Accounting.',
    lifecycleState: 'Published',
    includedCapabilityIds: ['cap-gamedev', 'cap-invoice'],
    requiredConnectors: ['GitHub Enterprise', 'Stripe Workspace', 'Slack Workspace'],
    securityProfile: 'High Security',
    roiEstimateRatio: 5.4,
    automationLevelPercent: 88,
    timeSavingsHoursPerWeek: 32,
  },
  {
    id: 'sol-enterprise-erp',
    name: 'Unified Enterprise ERP Solution',
    version: '1.2.0',
    domain: 'Enterprise ERP',
    owner: 'Chief Financial Officer',
    description: 'Comprehensive ERP solution governing Procurement, Inventory, Automated Invoice Processing, and Financial Closing.',
    lifecycleState: 'Published',
    includedCapabilityIds: ['cap-invoice', 'cap-mktg'],
    requiredConnectors: ['Stripe Workspace', 'Google Workspace'],
    securityProfile: 'High Security',
    roiEstimateRatio: 4.2,
    automationLevelPercent: 92,
    timeSavingsHoursPerWeek: 45,
  },
];

const DEFAULT_BLUEPRINTS: EnterpriseBlueprint[] = [
  {
    id: 'blp-gamestudio',
    solutionId: 'sol-gamestudio',
    title: 'Game Studio Operating Architecture Blueprint',
    departments: ['Engineering', 'Art & Graphics', 'QA Certification', 'Finance'],
    roles: ['Chief Architect', 'Game Producer', 'QA Automation Bot', 'Finance Lead'],
    executionFlowDag: [
      '1. Asset Pipeline Generation (Claude 3.5 Sonnet)',
      '2. Cargo Rust Engine Build & Clippy Verification',
      '3. Automated Playwright E2E Test Runner',
      '4. Stripe Revenue Log Reconciliation',
    ],
    complianceMandates: ['SHA-256 Event Vault Lock', 'Least Privilege MCP Sandbox', 'Human Approval Contract'],
    generatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

const DEFAULT_TEMPLATES: SolutionTemplate[] = [
  {
    id: 'tmpl-sol-gamestudio',
    title: 'Game Studio Enterprise Solution Template',
    domain: 'Game Studio',
    description: 'Complete pre-configured Game Studio solution uniting asset pipelines, QA bot, and license billing.',
    defaultCapabilities: ['Game Studio Master Pipeline', 'Automated Invoice Processing'],
    expectedAutomationPercent: 88,
  },
  {
    id: 'tmpl-sol-software',
    title: 'Software Enterprise Operating Solution Template',
    domain: 'Software Company',
    description: 'End-to-end software company solution combining GitHub PR bots, Jira sync, and customer support.',
    defaultCapabilities: ['Omni-Channel Marketing Campaign', 'Automated Invoice Processing'],
    expectedAutomationPercent: 90,
  },
];

export const useBusinessSolutionStore = create<BusinessSolutionState>((set, get) => ({
  solutions: DEFAULT_SOLUTIONS,
  blueprints: DEFAULT_BLUEPRINTS,
  templates: DEFAULT_TEMPLATES,

  activeSolutionId: 'sol-gamestudio',

  updateSolutionLifecycle: (id, newState) =>
    set((state) => ({
      solutions: state.solutions.map((s) => (s.id === id ? { ...s, lifecycleState: newState } : s)),
    })),

  generateBlueprint: (solutionId) => {
    const sol = get().solutions.find((s) => s.id === solutionId) ?? get().solutions[0];
    const newBlueprint: EnterpriseBlueprint = {
      id: `blp-${Date.now()}`,
      solutionId,
      title: `${sol.name} Architecture Blueprint`,
      departments: ['Engineering', 'Operations', 'Finance', 'Security Governance'],
      roles: [sol.owner, 'AI Sub-Agent Orchestration Thread', 'Compliance Officer'],
      executionFlowDag: [
        `1. Capability Discovery & Intent Resolution for '${sol.domain}'`,
        '2. Multi-Capability Execution DAG Dispatch',
        '3. Live System Telemetry Logging in Vault',
        '4. Post-Execution Reflection & ROI Evaluation',
      ],
      complianceMandates: [`Security Profile: ${sol.securityProfile}`, 'Zero Unapproved Mutations', 'Immutable Execution Contract'],
      generatedAt: new Date().toISOString(),
    };

    set((state) => ({ blueprints: [newBlueprint, ...state.blueprints] }));
    return newBlueprint;
  },

  instantiateSolutionFromTemplate: (templateId) =>
    set((state) => {
      const tmpl = state.templates.find((t) => t.id === templateId);
      if (!tmpl) return state;

      const newSol: BusinessSolution = {
        id: `sol-${Date.now()}`,
        name: tmpl.title.replace(' Template', ''),
        version: '1.0.0',
        domain: tmpl.domain as BusinessSolution['domain'],
        owner: 'Principal Solution Architect',
        description: tmpl.description,
        lifecycleState: 'Draft',
        includedCapabilityIds: ['cap-gamedev', 'cap-invoice'],
        requiredConnectors: ['GitHub Enterprise', 'Slack Workspace'],
        securityProfile: 'Standard Enterprise',
        roiEstimateRatio: 4.5,
        automationLevelPercent: tmpl.expectedAutomationPercent,
        timeSavingsHoursPerWeek: 28,
      };

      return {
        solutions: [newSol, ...state.solutions],
      };
    }),

  registerSolution: (sol) =>
    set((state) => ({
      solutions: [
        {
          id: `sol-${Date.now()}`,
          roiEstimateRatio: 4.8,
          automationLevelPercent: 85,
          timeSavingsHoursPerWeek: 25,
          ...sol,
        },
        ...state.solutions,
      ],
    })),
}));
