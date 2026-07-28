import {
  WorkflowInstance,
  WorkflowEvent,
  WorkflowState,
  WorkflowMetrics,
} from './types';
import { WorkflowRegistry } from './WorkflowRegistry';
import { WorkflowStateMachine } from './WorkflowStateMachine';
import { WorkflowScheduler } from './WorkflowScheduler';
import { WorkflowMetricsEngine } from './WorkflowMetricsEngine';
import { CompensationEngine } from './CompensationEngine';

export type WorkflowEventListener = (event: WorkflowEvent) => void;

export class WorkflowRuntime {
  private static instance: WorkflowRuntime;
  private instances = new Map<string, WorkflowInstance>();
  private listeners = new Set<WorkflowEventListener>();
  private eventLog: WorkflowEvent[] = [];
  private metricsEngine = WorkflowMetricsEngine.getInstance();
  private compensationEngine = CompensationEngine.getInstance();

  public static getInstance(): WorkflowRuntime {
    if (!WorkflowRuntime.instance) {
      WorkflowRuntime.instance = new WorkflowRuntime();
    }
    return WorkflowRuntime.instance;
  }

  public subscribe(listener: WorkflowEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(type: WorkflowEvent['type'], instanceId: string, nodeId?: string, payload?: Record<string, unknown>): void {
    const event: WorkflowEvent = {
      id: `EV-WF-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      workflowInstanceId: instanceId,
      nodeId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    if (this.eventLog.length > 200) {
      this.eventLog.pop();
    }
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): WorkflowEvent[] {
    return [...this.eventLog];
  }

  public async startWorkflow(workflowId: string, missionId = 'm_default', initialVariables: Record<string, unknown> = {}): Promise<WorkflowInstance> {
    const registry = WorkflowRegistry.getInstance();
    const def = registry.get(workflowId);
    if (!def) {
      throw new Error(`Workflow definition '${workflowId}' not found.`);
    }

    const instanceId = `WFI-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const instance: WorkflowInstance = {
      id: instanceId,
      workflowId,
      version: def.version || '1.0.0',
      missionId,
      state: 'ready',
      currentNodeId: def.startNodeId,
      activeNodeIds: [def.startNodeId],
      variables: initialVariables,
      history: [],
      pendingApprovals: [],
      startedAt: now,
    };

    this.instances.set(instanceId, instance);
    this.metricsEngine.recordInstanceStarted();
    this.transitionState(instance, 'running');
    this.emitEvent('WorkflowStarted', instanceId, def.startNodeId);

    await this.stepUntilWaitOrComplete(instance);

    return instance;
  }

  public async grantApproval(instanceId: string, nodeId: string): Promise<WorkflowInstance> {
    const instance = this.getInstanceOrThrow(instanceId);
    const registry = WorkflowRegistry.getInstance();
    const def = registry.get(instance.workflowId)!;

    this.emitEvent('ApprovalGranted', instanceId, nodeId);
    instance.pendingApprovals = (instance.pendingApprovals || []).filter((id) => id !== nodeId);

    this.transitionState(instance, 'running');

    const currentNode = def.nodes.get(nodeId);
    if (currentNode && currentNode.nextNodes && currentNode.nextNodes.length > 0) {
      instance.currentNodeId = currentNode.nextNodes[0];
    }

    await this.stepUntilWaitOrComplete(instance);
    return instance;
  }

  public async rejectApproval(instanceId: string, nodeId: string): Promise<WorkflowInstance> {
    const instance = this.getInstanceOrThrow(instanceId);
    this.emitEvent('ApprovalRejected', instanceId, nodeId);
    instance.pendingApprovals = (instance.pendingApprovals || []).filter((id) => id !== nodeId);

    await this.runCompensation(instanceId);
    return instance;
  }

  public async pauseWorkflow(instanceId: string): Promise<void> {
    const instance = this.getInstanceOrThrow(instanceId);
    this.transitionState(instance, 'paused');
    this.emitEvent('WorkflowPaused', instanceId);
  }

  public async resumeWorkflow(instanceId: string): Promise<void> {
    const instance = this.getInstanceOrThrow(instanceId);
    this.transitionState(instance, 'running');
    this.emitEvent('WorkflowResumed', instanceId);
    await this.stepUntilWaitOrComplete(instance);
  }

  public async cancelWorkflow(instanceId: string): Promise<void> {
    const instance = this.getInstanceOrThrow(instanceId);
    this.transitionState(instance, 'cancelled');
    this.emitEvent('WorkflowCancelled', instanceId);
  }

  public async runCompensation(instanceId: string): Promise<void> {
    const instance = this.getInstanceOrThrow(instanceId);
    const registry = WorkflowRegistry.getInstance();
    const def = registry.get(instance.workflowId)!;

    this.transitionState(instance, 'compensating');
    this.metricsEngine.recordCompensation();
    this.emitEvent('CompensationStarted', instanceId);

    await this.compensationEngine.executeCompensation(instance, def);

    this.emitEvent('CompensationCompleted', instanceId);
    this.transitionState(instance, 'failed');
    this.metricsEngine.recordInstanceFailed();
    this.emitEvent('WorkflowFailed', instanceId);
  }

  private async stepUntilWaitOrComplete(instance: WorkflowInstance): Promise<void> {
    const registry = WorkflowRegistry.getInstance();
    const def = registry.get(instance.workflowId)!;

    while (instance.state === 'running') {
      const stepRes = await WorkflowScheduler.stepInstance(instance, def);

      if (stepRes.requiresApprovalNodeId) {
        this.transitionState(instance, 'waiting');
        this.emitEvent('ApprovalRequested', instance.id, stepRes.requiresApprovalNodeId);
        break;
      }

      if (stepRes.nextState === 'completed') {
        this.transitionState(instance, 'completed');
        instance.completedAt = new Date().toISOString();
        const duration = new Date(instance.completedAt).getTime() - new Date(instance.startedAt).getTime();
        this.metricsEngine.recordInstanceCompleted(Math.max(0, duration));
        this.emitEvent('WorkflowCompleted', instance.id);
        break;
      }

      if (stepRes.nextState === 'failed') {
        await this.runCompensation(instance.id);
        break;
      }
    }
  }

  private transitionState(instance: WorkflowInstance, targetState: WorkflowState): void {
    WorkflowStateMachine.validateTransition(instance.state, targetState);
    instance.state = targetState;
  }

  public getInstanceRecord(instanceId: string): WorkflowInstance | undefined {
    return this.instances.get(instanceId);
  }

  public getAllInstances(): WorkflowInstance[] {
    return Array.from(this.instances.values());
  }

  public getMetrics(): WorkflowMetrics {
    const registry = WorkflowRegistry.getInstance();
    const allInstances = this.getAllInstances();
    const activeCount = allInstances.filter((i) => i.state === 'running' || i.state === 'waiting').length;
    const pendingApprovalsCount = allInstances.reduce((acc, i) => acc + (i.pendingApprovals?.length || 0), 0);

    return this.metricsEngine.getMetrics(
      registry.getAll().length,
      activeCount,
      pendingApprovalsCount
    );
  }

  private getInstanceOrThrow(instanceId: string): WorkflowInstance {
    const inst = this.instances.get(instanceId);
    if (!inst) {
      throw new Error(`Workflow instance '${instanceId}' not found.`);
    }
    return inst;
  }
}
