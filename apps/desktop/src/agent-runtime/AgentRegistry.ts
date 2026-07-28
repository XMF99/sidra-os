import { AgentModel, AgentCapability, AgentTemplate } from './types';

export class AgentRegistry {
  private agents = new Map<string, AgentModel>();
  private templates = new Map<string, AgentTemplate>();

  constructor() {
    this.registerDefaultTemplates();
  }

  private registerDefaultTemplates(): void {
    const defaultTemplates: AgentTemplate[] = [
      {
        id: 'tmpl_lead_architect',
        name: 'Lead Software Architect',
        department: 'Engineering',
        role: 'System Design & Code Reviewer',
        profile: {
          title: 'Principal Software Architect',
          bio: 'Specialized in distributed systems, Rust/TypeScript monorepos, and high-concurrency runtimes.',
          specialization: 'System Architecture & Security',
        },
        defaultCapabilities: ['coding', 'planning', 'analysis', 'documentation'],
        defaultSkills: [
          { id: 'sk_rust', name: 'Rust System Programming', category: 'engineering', proficiency: 98, description: 'Expert memory safety and async runtime orchestration' },
          { id: 'sk_ts', name: 'TypeScript Architecture', category: 'engineering', proficiency: 95, description: 'Design system tokens and React runtime components' },
        ],
        priority: 10,
        maxConcurrency: 3,
      },
      {
        id: 'tmpl_financial_auditor',
        name: 'Financial Compliance Auditor',
        department: 'Finance',
        role: 'PO & Ledger Auditor',
        profile: {
          title: 'Senior Financial Compliance Specialist',
          bio: 'Expert in corporate PO validation, Stripe/QuickBooks ledger reconciliation, and budget enforcement.',
          specialization: 'Financial Reconciliation & ERP',
        },
        defaultCapabilities: ['finance', 'analysis', 'research'],
        defaultSkills: [
          { id: 'sk_audit', name: 'PO Ledger Reconciliation', category: 'finance', proficiency: 96, description: 'Stripe, QuickBooks, and SAP invoice auditing' },
        ],
        priority: 9,
        maxConcurrency: 2,
      },
      {
        id: 'tmpl_gamedev_artist',
        name: '3D Technical Artist (UE5 & Blender)',
        department: 'Game Development',
        role: '3D Pipeline Engineer',
        profile: {
          title: 'Unreal Engine 5 Technical Artist',
          bio: 'Specialized in Meshy AI 3D asset generation, Blender retopology scripts, and UE5 material bindings.',
          specialization: '3D Graphics & UE5 Pipeline',
        },
        defaultCapabilities: ['3d_modeling', 'design', 'planning'],
        defaultSkills: [
          { id: 'sk_ue5', name: 'Unreal Engine 5 Asset Import', category: 'gamedev', proficiency: 94, description: 'fbx/gltf import and shader assignment' },
          { id: 'sk_blender', name: 'Blender Python Retopology', category: 'gamedev', proficiency: 92, description: 'Automated mesh decimation and UV unwrapping' },
        ],
        priority: 8,
        maxConcurrency: 2,
      },
    ];

    defaultTemplates.forEach((t) => this.templates.set(t.id, t));
  }

  public register(agent: AgentModel): void {
    this.agents.set(agent.id, agent);
  }

  public unregister(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  public getById(agentId: string): AgentModel | undefined {
    return this.agents.get(agentId);
  }

  public getAll(): AgentModel[] {
    return Array.from(this.agents.values());
  }

  public getAvailableForCapability(capability: AgentCapability): AgentModel[] {
    return this.getAll().filter(
      (a) => a.capabilities.includes(capability) && (a.state === 'ready' || a.state === 'initialized')
    );
  }

  public getTemplate(id: string): AgentTemplate | undefined {
    return this.templates.get(id);
  }

  public getAllTemplates(): AgentTemplate[] {
    return Array.from(this.templates.values());
  }
}
