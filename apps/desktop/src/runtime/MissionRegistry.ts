import { MissionTemplate } from './types';

export class MissionRegistry {
  private static instance: MissionRegistry;
  private templates = new Map<string, MissionTemplate>();

  private constructor() {
    this.registerDefaultTemplates();
  }

  public static getInstance(): MissionRegistry {
    if (!MissionRegistry.instance) {
      MissionRegistry.instance = new MissionRegistry();
    }
    return MissionRegistry.instance;
  }

  private registerDefaultTemplates(): void {
    const defaultTemplates: MissionTemplate[] = [
      {
        id: 'tmpl_software_launch',
        title: 'Enterprise Platform Release & Deployment',
        category: 'engineering',
        description: 'Strategic release mission coordinating automated build checks, QA workflows, Slack notifications, and production deployment',
        priority: 'critical',
        defaultWorkflowIds: ['wf_procurement', 'wf_content_publish'],
        defaultAutomationIds: ['auto_repo_ci_check', 'auto_system_health_audit'],
        requiredConnectorIds: ['conn_github', 'conn_slack', 'conn_grafana'],
        defaultAgentCapabilities: ['code_review', 'deployment', 'qa_testing'],
        milestones: [
          {
            title: 'Phase 1: Code Freeze & CI Verification',
            dueDate: '2026-08-01',
            completed: false,
            objectives: [
              { id: 'obj_101', title: 'Verify full unit & integration tests', description: 'Run cargo clippy and pnpm build', completed: true },
              { id: 'obj_102', title: 'Perform automated security dependency scan', description: 'Scan third party packages', completed: true },
            ],
          },
          {
            title: 'Phase 2: Staging Deploy & Executive Signoff',
            dueDate: '2026-08-05',
            completed: false,
            objectives: [
              { id: 'obj_103', title: 'Deploy to staging environment', description: 'Run staging smoke tests', completed: false },
              { id: 'obj_104', title: 'Obtain CTO executive approval', description: 'Trigger CFO/CTO approval gate', completed: false },
            ],
          },
        ],
      },
      {
        id: 'tmpl_financial_audit',
        title: 'Strategic Financial Audit & Procurement Review',
        category: 'finance',
        description: 'Comprehensive financial audit mission reviewing purchase orders, budget caps, QuickBooks records, and ERP alignment',
        priority: 'high',
        defaultWorkflowIds: ['wf_procurement'],
        defaultAutomationIds: ['auto_hourly_sync'],
        requiredConnectorIds: ['conn_quickbooks', 'conn_stripe'],
        defaultAgentCapabilities: ['financial_analysis', 'audit_reporting'],
        milestones: [
          {
            title: 'Phase 1: Expense Log Consolidation',
            dueDate: '2026-08-03',
            completed: false,
            objectives: [
              { id: 'obj_201', title: 'Fetch Stripe & QuickBooks ledgers', description: 'Export transaction CSVs', completed: true },
            ],
          },
          {
            title: 'Phase 2: Discrepancy & PO Reconciliation',
            dueDate: '2026-08-07',
            completed: false,
            objectives: [
              { id: 'obj_202', title: 'Reconcile purchase orders > $10,000', description: 'Verify executive signoffs', completed: false },
            ],
          },
        ],
      },
      {
        id: 'tmpl_gamedev_production',
        title: 'Next-Gen 3D AI Game Asset Production',
        category: 'gamedev',
        description: 'Automates Meshy AI model generation, Blender retopology, Unreal Engine 5 import, and scene packaging',
        priority: 'high',
        defaultWorkflowIds: ['wf_gamedev_pipeline'],
        defaultAutomationIds: ['auto_game_asset_build'],
        requiredConnectorIds: ['conn_meshy', 'conn_blender', 'conn_unreal'],
        defaultAgentCapabilities: ['3d_modeling', 'unreal_integration'],
        milestones: [
          {
            title: 'Phase 1: Concept & AI Mesh Generation',
            dueDate: '2026-08-10',
            completed: false,
            objectives: [
              { id: 'obj_301', title: 'Generate high-poly character mesh', description: 'Use Meshy AI connector', completed: true },
            ],
          },
          {
            title: 'Phase 2: Topology & UE5 Import',
            dueDate: '2026-08-15',
            completed: false,
            objectives: [
              { id: 'obj_302', title: 'Blender retopology and UV unwrapping', description: 'Run Blender script', completed: false },
              { id: 'obj_303', title: 'Import asset into UE5 project', description: 'Bind asset to level scene', completed: false },
            ],
          },
        ],
      },
    ];

    defaultTemplates.forEach((tmpl) => this.register(tmpl));
  }

  public register(template: MissionTemplate): void {
    this.templates.set(template.id, template);
  }

  public get(id: string): MissionTemplate | undefined {
    return this.templates.get(id);
  }

  public getAll(): MissionTemplate[] {
    return Array.from(this.templates.values());
  }
}
