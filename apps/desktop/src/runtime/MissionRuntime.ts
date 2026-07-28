import { ExecutionContext, MissionRunRecord, MissionState, RuntimeEvent, MissionMetrics } from './types';
import { StateMachine } from './StateMachine';
import { ExecutionQueue } from './ExecutionQueue';
import { Scheduler } from './Scheduler';
import { MissionRegistry } from './MissionRegistry';
import { MissionProgressEngine } from './MissionProgressEngine';
import { MissionMetricsEngine } from './MissionMetricsEngine';
import { AgentRuntime } from '../agent-runtime/AgentRuntime';
import { WorkflowRuntime } from '../workflow-runtime/WorkflowRuntime';
import { OrganizationRuntime } from '../organization-runtime/OrganizationRuntime';

export type EventListener = (event: RuntimeEvent) => void;

export class MissionRuntime {
  private static instance: MissionRuntime;
  private records = new Map<string, MissionRunRecord>();
  private queue: ExecutionQueue;
  private scheduler: Scheduler;
  private eventListeners = new Set<EventListener>();
  private eventLog: RuntimeEvent[] = [];
  private metricsEngine = MissionMetricsEngine.getInstance();

  private constructor() {
    this.queue = new ExecutionQueue();
    this.scheduler = new Scheduler(this.queue);
    this.createDefaultInitialMissions();
  }

  public static getInstance(): MissionRuntime {
    if (!MissionRuntime.instance) {
      MissionRuntime.instance = new MissionRuntime();
    }
    return MissionRuntime.instance;
  }

  public subscribe(listener: EventListener): () => void {
    this.eventListeners.add(listener);
    return () => this.eventListeners.delete(listener);
  }

  private emitEvent(type: string, missionId: string, correlationId: string, payload?: Record<string, unknown>): void {
    const event: RuntimeEvent = {
      id: `EV-MSN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      missionId,
      correlationId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    if (this.eventLog.length > 300) {
      this.eventLog.pop();
    }
    this.eventListeners.forEach((fn) => fn(event));
  }

  public getEventLog(): RuntimeEvent[] {
    return [...this.eventLog];
  }

  private createDefaultInitialMissions(): void {
    const registry = MissionRegistry.getInstance();
    const softwareTemplate = registry.get('tmpl_software_launch');
    if (softwareTemplate) {
      this.instantiateTemplate('tmpl_software_launch', 'Enterprise Platform Alpha Release');
    }
  }

  public instantiateTemplate(templateId: string, titleOverride?: string): MissionRunRecord {
    const registry = MissionRegistry.getInstance();
    const tmpl = registry.get(templateId);
    if (!tmpl) throw new Error(`Mission Template '${templateId}' not found.`);

    const id = `M-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const context: ExecutionContext = {
      missionId: id,
      workspaceId: 'ws_main_firm',
      actorId: 'founding_principal',
      permissions: ['*'],
      variables: { budgetLimitUSD: 5000 },
      environment: { NODE_ENV: 'production' },
      correlationId: `corr_${Math.random().toString(36).substring(2, 10)}`,
      traceId: `tr_${Math.random().toString(36).substring(2, 10)}`,
      executionTime: now,
    };

    const milestones = tmpl.milestones.map((m, idx) => ({
      ...m,
      id: `ms_${id}_${idx + 1}`,
      objectives: m.objectives.map((o) => ({ ...o })),
    }));

    const record: MissionRunRecord = {
      id,
      title: titleOverride || tmpl.title,
      category: tmpl.category,
      description: tmpl.description,
      priority: tmpl.priority,
      state: 'draft',
      context,
      progressPercent: 0,
      milestones,
      deliverables: [],
      assignedAgentIds: ['agent_code_expert', 'agent_qa_lead'],
      linkedWorkflowIds: [...tmpl.defaultWorkflowIds],
      linkedAutomationIds: [...tmpl.defaultAutomationIds],
      requiredConnectorIds: [...tmpl.requiredConnectorIds],
      dependencies: [],
      deadline: '2026-08-15',
      estimatedHoursRemaining: 24,
      createdAt: now,
      updatedAt: now,
    };

    this.records.set(id, record);
    record.progressPercent = MissionProgressEngine.calculateProgress(record);
    record.estimatedHoursRemaining = MissionProgressEngine.estimateRemainingHours(record);

    this.emitEvent('MissionCreated', id, context.correlationId, { templateId });
    return record;
  }

  public createMission(
    title: string,
    category = 'general',
    priority: MissionRunRecord['priority'] = 'medium',
    dependencies: string[] = []
  ): MissionRunRecord {
    const id = `M-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const context: ExecutionContext = {
      missionId: id,
      workspaceId: 'ws_main_firm',
      actorId: 'founding_principal',
      permissions: ['*'],
      variables: {},
      environment: { NODE_ENV: 'production' },
      correlationId: `corr_${Math.random().toString(36).substring(2, 10)}`,
      traceId: `tr_${Math.random().toString(36).substring(2, 10)}`,
      executionTime: now,
    };

    const record: MissionRunRecord = {
      id,
      title,
      category,
      description: `Custom Mission '${title}' created in Sidra OS`,
      priority,
      state: 'draft',
      context,
      progressPercent: 0,
      milestones: [],
      deliverables: [],
      assignedAgentIds: [],
      linkedWorkflowIds: [],
      linkedAutomationIds: [],
      requiredConnectorIds: [],
      dependencies,
      createdAt: now,
      updatedAt: now,
    };

    this.records.set(id, record);
    this.scheduler.validateNoCycles(id, dependencies, this.records);
    this.transitionState(id, 'planned');
    this.emitEvent('MissionCreated', id, context.correlationId, { priority, dependencies });

    return record;
  }

  public startMission(missionId: string, requiredCapability = 'analysis'): MissionRunRecord {
    const record = this.getRecordOrThrow(missionId);

    // 1. Policy check with OrganizationRuntime
    const orgRuntime = OrganizationRuntime.getInstance();
    const policyAction = orgRuntime.evaluatePolicy('Budget', { spendUSD: 150 });
    if (policyAction === 'deny') {
      throw new Error(`Mission '${missionId}' denied by Enterprise Policy.`);
    }

    this.transitionState(missionId, 'running');

    // 2. Coordinate Agent Runtime
    const agentRuntime = AgentRuntime.getInstance();
    const assignedAgent = agentRuntime.assignMission(missionId, requiredCapability);
    if (assignedAgent && !record.assignedAgentIds.includes(assignedAgent.id)) {
      record.assignedAgentIds.push(assignedAgent.id);
    }

    // 3. Coordinate Workflow Runtime
    if (record.linkedWorkflowIds.length > 0) {
      const workflowRuntime = WorkflowRuntime.getInstance();
      workflowRuntime.startWorkflow(record.linkedWorkflowIds[0], missionId, record.context.variables);
    }

    record.progressPercent = Math.max(record.progressPercent, 15);
    this.emitEvent('MissionStarted', missionId, record.context.correlationId, {
      assignedAgentId: assignedAgent?.id,
      linkedWorkflows: record.linkedWorkflowIds,
    });
    return record;
  }

  public pauseMission(missionId: string): MissionRunRecord {
    const record = this.getRecordOrThrow(missionId);
    this.transitionState(missionId, 'paused');
    this.emitEvent('MissionPaused', missionId, record.context.correlationId);
    return record;
  }

  public resumeMission(missionId: string): MissionRunRecord {
    const record = this.getRecordOrThrow(missionId);
    this.transitionState(missionId, 'running');
    this.emitEvent('MissionResumed', missionId, record.context.correlationId);
    return record;
  }

  public cancelMission(missionId: string): MissionRunRecord {
    const record = this.getRecordOrThrow(missionId);
    this.queue.cancel(missionId);
    this.transitionState(missionId, 'cancelled');
    this.emitEvent('MissionCancelled', missionId, record.context.correlationId);
    return record;
  }

  public archiveMission(missionId: string): MissionRunRecord {
    const record = this.getRecordOrThrow(missionId);
    this.transitionState(missionId, 'archived');
    this.emitEvent('MissionArchived', missionId, record.context.correlationId);
    return record;
  }

  public restartMission(missionId: string): MissionRunRecord {
    this.transitionState(missionId, 'ready');
    return this.startMission(missionId);
  }

  public completeMission(missionId: string, result?: unknown): MissionRunRecord {
    const record = this.getRecordOrThrow(missionId);
    this.transitionState(missionId, 'completed');
    record.progressPercent = 100;
    record.completedAt = new Date().toISOString();
    record.result = result;

    const duration = new Date(record.completedAt).getTime() - new Date(record.createdAt).getTime();
    this.metricsEngine.recordMissionCompleted(Math.max(0, duration));
    this.emitEvent('MissionCompleted', missionId, record.context.correlationId, { result });
    return record;
  }

  public failMission(missionId: string, error: string): MissionRunRecord {
    const record = this.getRecordOrThrow(missionId);
    this.transitionState(missionId, 'failed');
    record.error = error;
    this.emitEvent('MissionFailed', missionId, record.context.correlationId, { error });
    return record;
  }

  public toggleObjective(missionId: string, milestoneId: string, objectiveId: string): MissionRunRecord {
    const record = this.getRecordOrThrow(missionId);
    const ms = record.milestones.find((m) => m.id === milestoneId);
    if (ms) {
      const obj = ms.objectives.find((o) => o.id === objectiveId);
      if (obj) {
        obj.completed = !obj.completed;
      }
      ms.completed = ms.objectives.every((o) => o.completed);
    }
    record.progressPercent = MissionProgressEngine.calculateProgress(record);
    record.estimatedHoursRemaining = MissionProgressEngine.estimateRemainingHours(record);
    record.updatedAt = new Date().toISOString();
    this.emitEvent('ObjectiveToggled', missionId, record.context.correlationId, { milestoneId, objectiveId });
    return record;
  }

  private transitionState(missionId: string, targetState: MissionState): void {
    const record = this.getRecordOrThrow(missionId);
    StateMachine.validateTransition(record.state, targetState);
    record.state = targetState;
    record.updatedAt = new Date().toISOString();
  }

  public getRecord(missionId: string): MissionRunRecord | undefined {
    return this.records.get(missionId);
  }

  public getAllRecords(): MissionRunRecord[] {
    return Array.from(this.records.values());
  }

  public getMetrics(): MissionMetrics {
    return this.metricsEngine.getMetrics(this.getAllRecords());
  }

  private getRecordOrThrow(missionId: string): MissionRunRecord {
    const record = this.records.get(missionId);
    if (!record) {
      throw new Error(`Mission '${missionId}' not found in runtime.`);
    }
    return record;
  }

  public getQueue(): ExecutionQueue {
    return this.queue;
  }

  public getScheduler(): Scheduler {
    return this.scheduler;
  }
}
