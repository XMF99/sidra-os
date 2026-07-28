import {
  ExecutionPlan,
  PlanMetrics,
  PlanningEvent,
  PlanStage,
  PlanMilestone,
} from './types';
import { PlanningRegistry } from './PlanningRegistry';
import { CriticalPathEngine } from './CriticalPathEngine';
import { PlanOptimizationEngine } from './PlanOptimizationEngine';
import { ReplanningEngine } from './ReplanningEngine';
import { PlanningMetricsEngine } from './PlanningMetricsEngine';

export type PlanningEventListener = (event: PlanningEvent) => void;

export class PlanningEngine {
  private static instance: PlanningEngine;
  private registry = PlanningRegistry.getInstance();
  private metricsEngine = PlanningMetricsEngine.getInstance();
  private listeners = new Set<PlanningEventListener>();
  private eventLog: PlanningEvent[] = [];

  private constructor() {
    this.seedDefaultPlans();
  }

  public static getInstance(): PlanningEngine {
    if (!PlanningEngine.instance) {
      PlanningEngine.instance = new PlanningEngine();
    }
    return PlanningEngine.instance;
  }

  public subscribe(listener: PlanningEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(type: PlanningEvent['type'], planId: string, payload?: Record<string, unknown>): void {
    const event: PlanningEvent = {
      id: `EV-PLN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      planId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    if (this.eventLog.length > 300) {
      this.eventLog.pop();
    }
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): PlanningEvent[] {
    return [...this.eventLog];
  }

  private seedDefaultPlans(): void {
    this.generatePlanFromTemplate('tmpl_software_launch', 'Desktop Alpha 1.0 Release Plan', 'REQ-DEC-101');
    this.generatePlanFromTemplate('tmpl_gamedev_pipeline', 'AI Game Character Asset Pipeline', 'REQ-DEC-102');
  }

  public generatePlanFromTemplate(
    templateId: string,
    titleOverride?: string,
    decisionId?: string
  ): ExecutionPlan {
    const startTime = Date.now();
    const tmpl = this.registry.getTemplate(templateId);
    if (!tmpl) throw new Error(`Plan Template '${templateId}' not found.`);

    const id = `PLN-${Math.floor(100 + Math.random() * 900)}`;

    const stages: PlanStage[] = JSON.parse(JSON.stringify(tmpl.defaultStages));
    const milestones: PlanMilestone[] = JSON.parse(JSON.stringify(tmpl.defaultMilestones));

    const criticalPath = CriticalPathEngine.calculateCriticalPath(stages);
    const optimization = PlanOptimizationEngine.optimizePlan(stages);

    const now = new Date().toISOString();
    const plan: ExecutionPlan = {
      id,
      title: titleOverride || tmpl.name,
      planType: tmpl.planType,
      decisionId,
      goal: tmpl.description,
      stages: optimization.optimizedStages,
      milestones,
      criticalPathTaskIds: criticalPath.criticalPathTaskIds,
      totalEstimatedHours: criticalPath.totalHours,
      riskScore: optimization.overallRiskScore,
      optimizationScore: optimization.optimizationScore,
      status: 'approved',
      createdAt: now,
      updatedAt: now,
      replanCount: 0,
    };

    this.registry.storePlan(plan);
    const latency = Date.now() - startTime;
    this.metricsEngine.recordPlanningLatency(latency);

    this.emitEvent('PlanCreated', id, { title: plan.title, planType: plan.planType });
    this.emitEvent('CriticalPathCalculated', id, { criticalPathCount: criticalPath.criticalPathTaskIds.length, totalHours: criticalPath.totalHours });
    this.emitEvent('PlanOptimized', id, { score: plan.optimizationScore });

    return plan;
  }

  public replan(planId: string, reason: string): ExecutionPlan {
    const plan = this.registry.getPlan(planId);
    if (!plan) throw new Error(`Execution Plan '${planId}' not found.`);

    const replanned = ReplanningEngine.replan(plan, reason);
    this.registry.storePlan(replanned);

    this.emitEvent('PlanReplanned', planId, { reason, replanCount: replanned.replanCount });
    return replanned;
  }

  public getCriticalPath(planId: string) {
    const plan = this.registry.getPlan(planId);
    if (!plan) throw new Error(`Plan '${planId}' not found.`);
    return CriticalPathEngine.calculateCriticalPath(plan.stages);
  }

  public optimizePlan(planId: string): ExecutionPlan {
    const plan = this.registry.getPlan(planId);
    if (!plan) throw new Error(`Plan '${planId}' not found.`);

    const opt = PlanOptimizationEngine.optimizePlan(plan.stages);
    plan.stages = opt.optimizedStages;
    plan.optimizationScore = opt.optimizationScore;
    plan.riskScore = opt.overallRiskScore;
    plan.updatedAt = new Date().toISOString();

    this.registry.storePlan(plan);
    this.emitEvent('PlanOptimized', planId, { score: plan.optimizationScore });
    return plan;
  }

  public getPlanHistory(): ExecutionPlan[] {
    return this.registry.getAllPlans();
  }

  public getMetrics(): PlanMetrics {
    return this.metricsEngine.getMetrics(this.registry.getAllPlans());
  }

  public getRegistry(): PlanningRegistry {
    return this.registry;
  }
}
