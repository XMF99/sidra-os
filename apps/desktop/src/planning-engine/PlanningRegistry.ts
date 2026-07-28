import { PlanTemplate, ExecutionPlan } from './types';

export class PlanningRegistry {
  private static instance: PlanningRegistry;
  private templates = new Map<string, PlanTemplate>();
  private plans = new Map<string, ExecutionPlan>();

  private constructor() {
    this.seedDefaultTemplates();
  }

  public static getInstance(): PlanningRegistry {
    if (!PlanningRegistry.instance) {
      PlanningRegistry.instance = new PlanningRegistry();
    }
    return PlanningRegistry.instance;
  }

  private seedDefaultTemplates(): void {
    const tmpl1: PlanTemplate = {
      id: 'tmpl_software_launch',
      name: 'Software Platform Release Plan',
      planType: 'deployment',
      description: 'Standard 4-stage engineering deployment plan covering audit, build, integration testing, and production launch.',
      defaultStages: [
        {
          id: 'stg_1',
          name: 'Stage 1: Architecture & Compliance Audit',
          order: 1,
          tasks: [
            { id: 'tsk_audit_code', stageId: 'stg_1', title: 'Audit Core Runtimes & Dependencies', description: 'Run clippy and cargo fmt checks', assignedRuntime: 'agent', dependencies: [], estimatedDurationHours: 4, priority: 10, riskScore: 10, successCriteria: '0 warnings' },
          ],
        },
        {
          id: 'stg_2',
          name: 'Stage 2: Production Build & Bundle',
          order: 2,
          tasks: [
            { id: 'tsk_build_desktop', stageId: 'stg_2', title: 'Compile Desktop Production Assets', description: 'Vite build transformation', assignedRuntime: 'workflow', dependencies: ['tsk_audit_code'], estimatedDurationHours: 2, priority: 9, riskScore: 15, successCriteria: 'Clean bundle' },
          ],
        },
        {
          id: 'stg_3',
          name: 'Stage 3: Integration & Telemetry Verification',
          order: 3,
          tasks: [
            { id: 'tsk_verify_telemetry', stageId: 'stg_3', title: 'Verify Runtime Telemetry & Logs', description: 'Inspect events stream', assignedRuntime: 'automation', dependencies: ['tsk_build_desktop'], estimatedDurationHours: 3, priority: 8, riskScore: 10, successCriteria: 'Logs verified' },
          ],
        },
      ],
      defaultMilestones: [
        { id: 'ms_1', title: 'Milestone Alpha: Core Build Passed', targetStageId: 'stg_2', deliverableSummary: 'Desktop bundle generated', dueDate: '2026-08-01' },
      ],
    };

    const tmpl2: PlanTemplate = {
      id: 'tmpl_gamedev_pipeline',
      name: '3D AI Game Asset Pipeline Plan',
      planType: 'project',
      description: 'Pipeline plan for Meshy AI mesh generation, Blender retopology, and UE5 material bindings.',
      defaultStages: [
        {
          id: 'stg_3d_1',
          name: 'Stage 1: 3D Mesh Generation',
          order: 1,
          tasks: [
            { id: 'tsk_meshy_gen', stageId: 'stg_3d_1', title: 'Generate Meshy AI 3D Mesh', description: 'Request 3D model via Meshy connector', assignedRuntime: 'connector', dependencies: [], estimatedDurationHours: 1, priority: 8, riskScore: 20, successCriteria: 'GLTF model generated' },
          ],
        },
        {
          id: 'stg_3d_2',
          name: 'Stage 2: Blender Retopology & Shading',
          order: 2,
          tasks: [
            { id: 'tsk_blender_retopo', stageId: 'stg_3d_2', title: 'Blender Python Mesh Decimation', description: 'Run retopology script', assignedRuntime: 'agent', dependencies: ['tsk_meshy_gen'], estimatedDurationHours: 3, priority: 7, riskScore: 15, successCriteria: 'Clean topology' },
          ],
        },
      ],
      defaultMilestones: [
        { id: 'ms_3d_1', title: 'Milestone 3D: Asset Imported to UE5', targetStageId: 'stg_3d_2', deliverableSummary: 'Model bound in UE5', dueDate: '2026-08-05' },
      ],
    };

    this.templates.set(tmpl1.id, tmpl1);
    this.templates.set(tmpl2.id, tmpl2);
  }

  public getTemplate(id: string): PlanTemplate | undefined {
    return this.templates.get(id);
  }

  public getAllTemplates(): PlanTemplate[] {
    return Array.from(this.templates.values());
  }

  public storePlan(plan: ExecutionPlan): void {
    this.plans.set(plan.id, plan);
  }

  public getPlan(id: string): ExecutionPlan | undefined {
    return this.plans.get(id);
  }

  public getAllPlans(): ExecutionPlan[] {
    return Array.from(this.plans.values());
  }
}
