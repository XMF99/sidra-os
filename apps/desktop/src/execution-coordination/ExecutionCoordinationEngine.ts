import {
  ExecutionSession,
  DispatchedTaskToken,
  ExecutionMetrics,
  ExecutionEvent,
} from './types';
import { ExecutionStateMachine } from './ExecutionStateMachine';
import { RuntimeDispatcher } from './RuntimeDispatcher';
import { FailureCoordinator } from './FailureCoordinator';
import { ExecutionRegistry } from './ExecutionRegistry';
import { ExecutionMetricsEngine } from './ExecutionMetricsEngine';
import { PlanningEngine } from '../planning-engine/PlanningEngine';
import { MissionRuntime } from '../runtime/MissionRuntime';

export type ExecutionEventListener = (event: ExecutionEvent) => void;

export class ExecutionCoordinationEngine {
  private static instance: ExecutionCoordinationEngine;
  private registry = ExecutionRegistry.getInstance();
  private metricsEngine = ExecutionMetricsEngine.getInstance();
  private listeners = new Set<ExecutionEventListener>();
  private eventLog: ExecutionEvent[] = [];

  private constructor() {
    this.seedDefaultSessions();
  }

  public static getInstance(): ExecutionCoordinationEngine {
    if (!ExecutionCoordinationEngine.instance) {
      ExecutionCoordinationEngine.instance = new ExecutionCoordinationEngine();
    }
    return ExecutionCoordinationEngine.instance;
  }

  public subscribe(listener: ExecutionEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(type: ExecutionEvent['type'], sessionId: string, payload?: Record<string, unknown>): void {
    const event: ExecutionEvent = {
      id: `EV-EXE-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      sessionId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    if (this.eventLog.length > 300) {
      this.eventLog.pop();
    }
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): ExecutionEvent[] {
    return [...this.eventLog];
  }

  private seedDefaultSessions(): void {
    try {
      const planningEngine = PlanningEngine.getInstance();
      const plans = planningEngine.getPlanHistory();
      if (plans.length > 0) {
        this.startExecution(plans[0].id);
      }
    } catch (e) {
      // Ignore if seeding during initial boot
    }
  }

  public startExecution(planId: string): ExecutionSession {
    const planningEngine = PlanningEngine.getInstance();
    const plan = planningEngine.getRegistry().getPlan(planId) || planningEngine.getPlanHistory()[0];
    const sessionId = `SES-EXE-${Math.floor(100 + Math.random() * 900)}`;

    const now = new Date().toISOString();

    const dispatchedTokens: DispatchedTaskToken[] = [];
    const activeRuntimes = new Set<DispatchedTaskToken['runtime']>();

    if (plan && plan.stages) {
      plan.stages.forEach((stage) => {
        stage.tasks.forEach((task) => {
          dispatchedTokens.push({
            id: `TOK-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sessionId,
            taskId: task.id,
            stageId: stage.id,
            taskTitle: task.title,
            runtime: task.assignedRuntime,
            status: 'dispatched',
            priority: task.priority,
            retryCount: 0,
            dispatchedAt: now,
          });
          activeRuntimes.add(task.assignedRuntime);
        });
      });
    }

    const session: ExecutionSession = {
      id: sessionId,
      planId,
      planTitle: plan?.title || 'System Execution Plan',
      state: 'running',
      progressPercent: 35,
      currentStageId: plan?.stages?.[0]?.id || 'stg_1',
      dispatchedTasks: dispatchedTokens,
      completedTaskIds: dispatchedTokens.slice(0, 1).map((t) => t.taskId),
      failedTaskIds: [],
      activeRuntimes: Array.from(activeRuntimes),
      createdAt: now,
      updatedAt: now,
      startedAt: now,
    };

    this.registry.storeSession(session);
    this.emitEvent('SessionCreated', sessionId, { planId, title: session.planTitle });
    this.emitEvent('SessionStarted', sessionId, { dispatchedCount: dispatchedTokens.length });

    // Asynchronously dispatch initial tasks
    dispatchedTokens.forEach((tok) => this.executeDispatchedTask(session, tok));

    return session;
  }

  private async executeDispatchedTask(session: ExecutionSession, token: DispatchedTaskToken) {
    this.emitEvent('TaskDispatched', session.id, { taskId: token.taskId, runtime: token.runtime });
    const res = await RuntimeDispatcher.dispatch(token);

    if (res.success) {
      token.status = 'completed';
      token.completedAt = new Date().toISOString();
      token.resultPayload = res.payload;
      if (!session.completedTaskIds.includes(token.taskId)) {
        session.completedTaskIds.push(token.taskId);
      }
      this.trackProgress(session.id);
      this.emitEvent('TaskCompleted', session.id, { taskId: token.taskId, runtime: token.runtime });
    } else {
      token.status = 'failed';
      if (!session.failedTaskIds.includes(token.taskId)) {
        session.failedTaskIds.push(token.taskId);
      }
      this.emitEvent('TaskFailed', session.id, { taskId: token.taskId, error: res.error });

      const recoveryAction = FailureCoordinator.handleTaskFailure(token, session.planId);
      this.registry.addRecoveryAction(recoveryAction);
      this.emitEvent('RecoveryInitiated', session.id, { action: recoveryAction.actionType, reason: recoveryAction.reason });
    }
  }

  public pauseExecution(sessionId: string): void {
    const session = this.getRequiredSession(sessionId);
    ExecutionStateMachine.validateTransition(session.state, 'paused');
    session.state = 'paused';
    session.updatedAt = new Date().toISOString();
    this.emitEvent('SessionPaused', sessionId);
  }

  public resumeExecution(sessionId: string): void {
    const session = this.getRequiredSession(sessionId);
    ExecutionStateMachine.validateTransition(session.state, 'running');
    session.state = 'running';
    session.updatedAt = new Date().toISOString();
    this.emitEvent('SessionResumed', sessionId);
  }

  public cancelExecution(sessionId: string): void {
    const session = this.getRequiredSession(sessionId);
    ExecutionStateMachine.validateTransition(session.state, 'cancelled');
    session.state = 'cancelled';
    session.updatedAt = new Date().toISOString();
    this.emitEvent('SessionCancelled', sessionId);
  }

  public trackProgress(sessionId: string): number {
    const session = this.getRequiredSession(sessionId);
    const total = session.dispatchedTasks.length;
    if (total === 0) return 100;

    const completed = session.completedTaskIds.length;
    const pct = Math.round((completed / total) * 100);
    session.progressPercent = pct;

    if (pct === 100 && session.state !== 'completed') {
      session.state = 'completed';
      session.completedAt = new Date().toISOString();
      this.emitEvent('SessionCompleted', sessionId);

      try {
        const missionRuntime = MissionRuntime.getInstance();
        const activeMsn = missionRuntime.getAllRecords().find((m) => m.state === 'running');
        if (activeMsn) {
          activeMsn.progressPercent = Math.min(100, activeMsn.progressPercent + 10);
        }
      } catch (e) {
        // Ignore if mission runtime not actively matching
      }
    }

    return pct;
  }

  public getExecutionHistory(): ExecutionSession[] {
    return this.registry.getAllSessions();
  }

  public getMetrics(): ExecutionMetrics {
    return this.metricsEngine.getMetrics(this.registry.getAllSessions(), this.registry.getRecoveryActions());
  }

  public getRegistry(): ExecutionRegistry {
    return this.registry;
  }

  private getRequiredSession(sessionId: string): ExecutionSession {
    const session = this.registry.getSession(sessionId);
    if (!session) throw new Error(`Execution Session '${sessionId}' not found.`);
    return session;
  }
}
