import { create } from 'zustand';

export type OperatingModel = 'Centralized' | 'Matrix' | 'Decentralized' | 'Hybrid' | 'Holding Company';
export type EnterpriseLifecycle = 'Draft' | 'Simulation' | 'Testing' | 'Approved' | 'Operational' | 'Archived';

export interface DepartmentNode {
  id: string;
  name: string;
  headRole: string;
  solutionsAssigned: string[];
  aiWorkersCount: number;
  humanRolesCount: number;
}

export interface OrgChartNode {
  id: string;
  label: string;
  roleType: 'Executive' | 'Department Head' | 'Human Staff' | 'AI Sub-Agent';
  reportsToId?: string;
  departmentId: string;
}

export interface EnterpriseOrganization {
  id: string;
  name: string;
  industry: string;
  operatingModel: OperatingModel;
  owner: string;
  lifecycleState: EnterpriseLifecycle;
  departments: DepartmentNode[];
  orgChart: OrgChartNode[];
  operationalHealthScore: number; // 0..100
  aiUtilizationPercent: number; // 0..100
}

export interface MasterEnterpriseBlueprint {
  id: string;
  enterpriseId: string;
  title: string;
  operatingModel: OperatingModel;
  departmentsCount: number;
  solutionsCount: number;
  aiWorkersCount: number;
  governanceRules: string[];
  generatedAt: string;
}

export interface EnterpriseTemplate {
  id: string;
  title: string;
  industry: string;
  description: string;
  defaultDepartments: string[];
  expectedAiUtilizationPercent: number;
}

interface EnterpriseComposerState {
  enterprises: EnterpriseOrganization[];
  masterBlueprints: MasterEnterpriseBlueprint[];
  templates: EnterpriseTemplate[];

  activeEnterpriseId: string;

  // Actions
  updateEnterpriseLifecycle: (id: string, newState: EnterpriseLifecycle) => void;
  generateMasterBlueprint: (enterpriseId: string) => MasterEnterpriseBlueprint;
  instantiateEnterpriseFromTemplate: (templateId: string) => void;
  registerEnterprise: (ent: Omit<EnterpriseOrganization, 'id' | 'operationalHealthScore' | 'aiUtilizationPercent'>) => void;
}

const DEFAULT_DEPARTMENTS: DepartmentNode[] = [
  { id: 'dept-exec', name: 'Executive Office', headRole: 'CEO / Chief Architect', solutionsAssigned: ['sol-gamestudio'], aiWorkersCount: 4, humanRolesCount: 2 },
  { id: 'dept-eng', name: 'Game Studio & Software Engineering', headRole: 'VP of Engineering', solutionsAssigned: ['sol-gamestudio'], aiWorkersCount: 12, humanRolesCount: 8 },
  { id: 'dept-fin', name: 'Finance & Revenue Operations', headRole: 'CFO / Finance Director', solutionsAssigned: ['sol-enterprise-erp'], aiWorkersCount: 6, humanRolesCount: 4 },
];

const DEFAULT_ORG_CHART: OrgChartNode[] = [
  { id: 'org-ceo', label: 'Chief Executive Officer', roleType: 'Executive', departmentId: 'dept-exec' },
  { id: 'org-vpeng', label: 'VP of Software & Game Engineering', roleType: 'Department Head', reportsToId: 'org-ceo', departmentId: 'dept-eng' },
  { id: 'org-bot-qa', label: 'QA Certification Sub-Agent Bot', roleType: 'AI Sub-Agent', reportsToId: 'org-vpeng', departmentId: 'dept-eng' },
  { id: 'org-cfo', label: 'Chief Financial Officer', roleType: 'Department Head', reportsToId: 'org-ceo', departmentId: 'dept-fin' },
  { id: 'org-bot-fin', label: 'Stripe Accounting Sync Sub-Agent', roleType: 'AI Sub-Agent', reportsToId: 'org-cfo', departmentId: 'dept-fin' },
];

const DEFAULT_ENTERPRISES: EnterpriseOrganization[] = [
  {
    id: 'ent-sidra',
    name: 'Sidra OS Enterprise Corporation',
    industry: 'Interactive Software & Game Studio',
    operatingModel: 'Matrix',
    owner: 'Chief Executive Architect',
    lifecycleState: 'Operational',
    departments: DEFAULT_DEPARTMENTS,
    orgChart: DEFAULT_ORG_CHART,
    operationalHealthScore: 98,
    aiUtilizationPercent: 78,
  },
];

const DEFAULT_MASTER_BLUEPRINTS: MasterEnterpriseBlueprint[] = [
  {
    id: 'mblp-sidra',
    enterpriseId: 'ent-sidra',
    title: 'Sidra OS Master Enterprise Architecture Blueprint',
    operatingModel: 'Matrix',
    departmentsCount: 3,
    solutionsCount: 2,
    aiWorkersCount: 22,
    governanceRules: [
      '100% SHA-256 Vault Event Hash Mandate',
      'Immutable Execution Contract Enforcement for PR Merges',
      'Least Privilege MCP Tool Access Control',
    ],
    generatedAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

const DEFAULT_TEMPLATES: EnterpriseTemplate[] = [
  {
    id: 'tmpl-ent-gamestudio',
    title: 'Game Studio Enterprise Architecture Template',
    industry: 'Gaming & Interactive Entertainment',
    description: 'Pre-configured enterprise organization with Game Studio Engineering, Revenue Operations, and QA Certification.',
    defaultDepartments: ['Executive Office', 'Game Studio Engineering', 'QA Certification', 'Finance'],
    expectedAiUtilizationPercent: 82,
  },
  {
    id: 'tmpl-ent-software',
    title: 'Software Corporation Enterprise Template',
    industry: 'Enterprise Software & SaaS',
    description: 'Complete SaaS software corporation template uniting Product Engineering, Marketing, Sales, and Customer Success.',
    defaultDepartments: ['Executive Office', 'Product Engineering', 'Sales & CRM', 'Customer Success'],
    expectedAiUtilizationPercent: 76,
  },
];

export const useEnterpriseComposerStore = create<EnterpriseComposerState>((set, get) => ({
  enterprises: DEFAULT_ENTERPRISES,
  masterBlueprints: DEFAULT_MASTER_BLUEPRINTS,
  templates: DEFAULT_TEMPLATES,

  activeEnterpriseId: 'ent-sidra',

  updateEnterpriseLifecycle: (id, newState) =>
    set((state) => ({
      enterprises: state.enterprises.map((e) => (e.id === id ? { ...e, lifecycleState: newState } : e)),
    })),

  generateMasterBlueprint: (enterpriseId) => {
    const ent = get().enterprises.find((e) => e.id === enterpriseId) ?? get().enterprises[0];
    const totalAi = ent.departments.reduce((acc, d) => acc + d.aiWorkersCount, 0);

    const newMaster: MasterEnterpriseBlueprint = {
      id: `mblp-${Date.now()}`,
      enterpriseId,
      title: `${ent.name} Master Enterprise Architecture Blueprint`,
      operatingModel: ent.operatingModel,
      departmentsCount: ent.departments.length,
      solutionsCount: 2,
      aiWorkersCount: totalAi,
      governanceRules: [
        `Operating Model: ${ent.operatingModel}`,
        'Automated Replanning & Failure Recovery Enabled',
        'Zero Production Mutation Digital Twin Sandbox Protection',
      ],
      generatedAt: new Date().toISOString(),
    };

    set((state) => ({ masterBlueprints: [newMaster, ...state.masterBlueprints] }));
    return newMaster;
  },

  instantiateEnterpriseFromTemplate: (templateId) =>
    set((state) => {
      const tmpl = state.templates.find((t) => t.id === templateId);
      if (!tmpl) return state;

      const newEnt: EnterpriseOrganization = {
        id: `ent-${Date.now()}`,
        name: tmpl.title.replace(' Architecture Template', '').replace(' Enterprise Template', ''),
        industry: tmpl.industry,
        operatingModel: 'Matrix',
        owner: 'Principal Enterprise Architect',
        lifecycleState: 'Draft',
        departments: DEFAULT_DEPARTMENTS,
        orgChart: DEFAULT_ORG_CHART,
        operationalHealthScore: 95,
        aiUtilizationPercent: tmpl.expectedAiUtilizationPercent,
      };

      return {
        enterprises: [newEnt, ...state.enterprises],
      };
    }),

  registerEnterprise: (ent) =>
    set((state) => ({
      enterprises: [
        {
          id: `ent-${Date.now()}`,
          operationalHealthScore: 98,
          aiUtilizationPercent: 75,
          ...ent,
        },
        ...state.enterprises,
      ],
    })),
}));
