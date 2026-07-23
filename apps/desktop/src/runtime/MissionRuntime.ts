import { ExecutionContext, MissionRunRecord, MissionState, RuntimeEvent } from './types';
import { StateMachine } from './StateMachine';
import { ExecutionQueue } from './ExecutionQueue';
import { Scheduler } from './Scheduler';

export type EventListener = (event: RuntimeEvent) => void;

export class MissionRuntime {
  private static instance: MissionRuntime;
  private records = new Map<string, MissionRunRecord>();
  private queue: ExecutionQueue;
  private scheduler: Scheduler;
  private eventListeners = new Set<EventListener>();
  private eventLog: RuntimeEvent[] = [];

  private constructor() {
    this.queue = new ExecutionQueue();
    this.scheduler = new Scheduler(this.queue);
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
      id: `EV-RT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      missionId,
      correlationId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    this.eventListeners.forEach((fn) => fn(event));
  }

  public getEventLog(): RuntimeEvent[] {
    return [...this.eventLog];
  }

  public createMission(title: string, priority = 5, dependencies: string[] = []): MissionRunRecord {
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
      state: 'draft',
      context,
      progressPercent: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.records.set(id, record);
    this.scheduler.validateNoCycles(id, dependencies, this.records);

    // Enqueue
    this.transitionState(id, 'queued');
    this.queue.enqueue({
      missionId: id,
      context,
      priority,
      dependencies,
      enqueuedAt: now,
    });
    this.emitEvent('MissionQueued', id, context.correlationId, { priority, dependencies });

    return record;
  }

  public startNextScheduled(): MissionRunRecord | undefined {
    const nextItem = this.scheduler.getNextRunnableMission(this.records);
    if (!nextItem) return undefined;

    this.queue.dequeue();
    return this.startMission(nextItem.missionId);
  }

  public startMission(missionId: string): MissionRunRecord {
    const record = this.getRecordOrThrow(missionId);
    this.transitionState(missionId, 'running');
    record.progressPercent = 10;
    this.emitEvent('MissionStarted', missionId, record.context.correlationId);
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

  public retryMission(missionId: string): MissionRunRecord {
    const record = this.getRecordOrThrow(missionId);
    this.transitionState(missionId, 'queued');
    this.queue.enqueue({
      missionId,
      context: record.context,
      priority: 5,
      dependencies: [],
      enqueuedAt: new Date().toISOString(),
    });
    this.emitEvent('MissionRetried', missionId, record.context.correlationId);
    return record;
  }

  public completeMission(missionId: string, result?: unknown): MissionRunRecord {
    const record = this.getRecordOrThrow(missionId);
    this.transitionState(missionId, 'completed');
    record.progressPercent = 100;
    record.result = result;
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
