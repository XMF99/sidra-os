import {
  WorkflowInstance,
  WorkflowEvent,
  WorkflowState,
} from './types';
import { WorkflowRegistry } from './WorkflowRegistry';
import { WorkflowStateMachine } from './WorkflowStateMachine';
import { WorkflowScheduler } from './WorkflowScheduler';
import { WorkflowExecutor } from './WorkflowExecutor';

export type WorkflowEventListener = (event: WorkflowEvent) => void;

export class WorkflowRuntime {
  private static instance: WorkflowRuntime;
  private instances = new Map<string, WorkflowInstance>();
  private listeners = new Set<WorkflowEventListener>();
  private eventLog: WorkflowEvent[] = [];

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
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): WorkflowEvent[] {
    return [...this.eventLog];
  }

  public async startWorkflow(workflowId: string, missionId: string, initialVariables: Record<string, unknown> = {}): Promise<WorkflowInstance> {
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

  public async runCompensation(instanceId: string): Promise<void> {
    const instance = this.getInstanceOrThrow(instanceId);
    const registry = WorkflowRegistry.getInstance();
    const def = registry.get(instance.workflowId)!;

    this.transitionState(instance, 'compensating');
    this.emitEvent('CompensationStarted', instanceId);

    await WorkflowExecutor.executeCompensation(instance, def);

    this.emitEvent('CompensationCompleted', instanceId);
    this.transitionState(instance, 'failed');
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

  private getInstanceOrThrow(instanceId: string): WorkflowInstance {
    const inst = this.instances.get(instanceId);
    if (!inst) {
      throw new Error(`Workflow instance '${instanceId}' not found.`);
    }
    return inst;
  }
}
