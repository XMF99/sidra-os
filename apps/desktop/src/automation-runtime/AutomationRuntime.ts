import {
  Automation,
  AutomationEvent,
  ExecutionQueueItem,
  AutomationMetrics,
  AutomationLog,
} from './types';
import { TriggerEngine } from './TriggerEngine';
import { ExecutionQueue } from './ExecutionQueue';
import { DependencyResolver } from './DependencyResolver';
import { AutomationScheduler } from './AutomationScheduler';
import { AutomationHistoryStore } from './AutomationHistoryStore';
import { AutomationMetricsEngine } from './AutomationMetricsEngine';

export type AutomationEventListener = (event: AutomationEvent) => void;

export class AutomationRuntime {
  private static instance: AutomationRuntime;
  private automations = new Map<string, Automation>();
  private triggerEngine = TriggerEngine.getInstance();
  private executionQueue = ExecutionQueue.getInstance();
  private scheduler = AutomationScheduler.getInstance();
  private historyStore = AutomationHistoryStore.getInstance();
  private metricsEngine = AutomationMetricsEngine.getInstance();

  private listeners = new Set<AutomationEventListener>();
  private eventLog: AutomationEvent[] = [];

  private constructor() {
    this.registerDefaultAutomations();
    this.subscribeToQueue();
    this.subscribeToTriggers();
  }

  public static getInstance(): AutomationRuntime {
    if (!AutomationRuntime.instance) {
      AutomationRuntime.instance = new AutomationRuntime();
    }
    return AutomationRuntime.instance;
  }

  public subscribe(listener: AutomationEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(
    type: AutomationEvent['type'],
    automationId: string,
    jobId?: string,
    payload?: Record<string, unknown>
  ): void {
    const event: AutomationEvent = {
      id: `EV-AUTO-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      automationId,
      jobId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    if (this.eventLog.length > 300) {
      this.eventLog.pop();
    }
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): AutomationEvent[] {
    return [...this.eventLog];
  }

  private subscribeToQueue(): void {
    this.executionQueue.subscribe((jobItem) => {
      this.historyStore.recordJob(jobItem);

      if (jobItem.state === 'completed') {
        const start = jobItem.startedAt ? new Date(jobItem.startedAt).getTime() : Date.now();
        const end = jobItem.finishedAt ? new Date(jobItem.finishedAt).getTime() : Date.now();
        this.metricsEngine.recordExecution(true, Math.max(0, end - start));
        this.emitEvent('AutomationCompleted', jobItem.automationId, jobItem.jobId);

        const auto = this.automations.get(jobItem.automationId);
        if (auto) {
          auto.state = 'idle';
          auto.lastRunAt = jobItem.finishedAt;
        }
      } else if (jobItem.state === 'failed') {
        const start = jobItem.startedAt ? new Date(jobItem.startedAt).getTime() : Date.now();
        const end = jobItem.finishedAt ? new Date(jobItem.finishedAt).getTime() : Date.now();
        this.metricsEngine.recordExecution(false, Math.max(0, end - start));
        this.emitEvent('AutomationFailed', jobItem.automationId, jobItem.jobId, { error: jobItem.error });

        const auto = this.automations.get(jobItem.automationId);
        if (auto) {
          auto.state = 'failed';
        }
      }
    });
  }

  private subscribeToTriggers(): void {
    this.triggerEngine.subscribe((triggerType, payload) => {
      this.automations.forEach((auto) => {
        if (auto.enabled && auto.trigger.type === triggerType) {
          this.triggerAutomation(auto.id, payload);
        }
      });
    });
  }

  private registerDefaultAutomations(): void {
    const defaults: Automation[] = [
      {
        id: 'auto_hourly_sync',
        name: 'Hourly Knowledge & Document Ingestion',
        description: 'Auto-syncs local documents, chunks content, and refreshes vector embeddings hourly',
        enabled: true,
        state: 'scheduled',
        trigger: { type: 'cron', schedulePattern: '0 * * * *' },
        actions: [
          { type: 'file_operation', scriptContent: 'Scan C:\\SidraWorkspaces for new files' },
          { type: 'execute_connector_capability', targetId: 'conn_gdrive', capability: 'search' },
          { type: 'send_notification', notificationTitle: 'Sync Complete', notificationMessage: 'Hourly Ingestion Updated' },
        ],
        priority: 'medium',
        executionMode: 'sequential',
        createdAt: new Date().toISOString(),
        tags: ['knowledge', 'cron', 'documents'],
      },
      {
        id: 'auto_repo_ci_check',
        name: 'GitHub Commit & CI Pipeline Automation',
        description: 'Triggers automated code verification, test runs, and Slack notifications on repo push',
        enabled: true,
        state: 'idle',
        trigger: { type: 'connector_event', sourceConnectorId: 'conn_github', eventFilter: 'PushEvent' },
        actions: [
          { type: 'execute_connector_capability', targetId: 'conn_github', capability: 'read' },
          { type: 'execute_command', commandString: 'pnpm --filter @sidra/desktop build' },
          { type: 'execute_connector_capability', targetId: 'conn_slack', capability: 'write' },
        ],
        priority: 'high',
        executionMode: 'sequential',
        createdAt: new Date().toISOString(),
        tags: ['ci_cd', 'github', 'slack'],
      },
      {
        id: 'auto_game_asset_build',
        name: 'Unreal & Unity Asset Pipeline Build',
        description: 'Automates Meshy AI 3D generation -> Blender optimization -> Unreal Engine import',
        enabled: true,
        state: 'idle',
        trigger: { type: 'manual' },
        actions: [
          { type: 'execute_connector_capability', targetId: 'conn_meshy', capability: 'create' },
          { type: 'execute_connector_capability', targetId: 'conn_blender', capability: 'execute' },
          { type: 'execute_connector_capability', targetId: 'conn_unreal', capability: 'execute' },
        ],
        priority: 'critical',
        executionMode: 'sequential',
        createdAt: new Date().toISOString(),
        tags: ['gamedev', 'unreal', 'blender', 'ai'],
      },
      {
        id: 'auto_system_health_audit',
        name: 'Daily System Health & Telemetry Audit',
        description: 'Runs connector diagnostics, checks database indexes, and archives runtime logs',
        enabled: true,
        state: 'scheduled',
        trigger: { type: 'schedule', schedulePattern: 'interval_60s' },
        actions: [
          { type: 'execute_connector_capability', targetId: 'conn_grafana', capability: 'read' },
          { type: 'send_notification', notificationTitle: 'Health Audit', notificationMessage: 'System Operational' },
        ],
        priority: 'low',
        executionMode: 'parallel',
        createdAt: new Date().toISOString(),
        tags: ['observability', 'health', 'telemetry'],
      },
    ];

    defaults.forEach((auto) => {
      this.registerAutomation(auto);
    });
  }

  public registerAutomation(automation: Automation): void {
    this.automations.set(automation.id, automation);
    this.emitEvent('AutomationCreated', automation.id);

    this.scheduler.scheduleAutomation(automation, () => {
      this.triggerAutomation(automation.id);
    });
  }

  public getAutomation(id: string): Automation | undefined {
    return this.automations.get(id);
  }

  public getAllAutomations(): Automation[] {
    return Array.from(this.automations.values());
  }

  public triggerAutomation(id: string, payload?: Record<string, unknown>): ExecutionQueueItem {
    const auto = this.automations.get(id);
    if (!auto) throw new Error(`Automation '${id}' not found.`);

    auto.state = 'queued';
    auto.lastRunAt = new Date().toISOString();
    this.emitEvent('AutomationTriggered', id, undefined, payload);

    const job = this.executionQueue.enqueue(auto);
    this.emitEvent('AutomationQueued', id, job.jobId);
    this.historyStore.addLog(id, job.jobId, 'info', `Automation '${auto.name}' queued successfully.`);

    return job;
  }

  public pauseAutomation(id: string): void {
    const auto = this.automations.get(id);
    if (auto) {
      auto.state = 'paused';
      auto.enabled = false;
      this.scheduler.cancelScheduledAutomation(id);
      this.emitEvent('AutomationPaused', id);
      this.historyStore.addLog(id, 'N/A', 'warn', `Automation '${auto.name}' paused.`);
    }
  }

  public resumeAutomation(id: string): void {
    const auto = this.automations.get(id);
    if (auto) {
      auto.state = 'idle';
      auto.enabled = true;
      this.scheduler.scheduleAutomation(auto, () => {
        this.triggerAutomation(auto.id);
      });
      this.emitEvent('AutomationResumed', id);
      this.historyStore.addLog(id, 'N/A', 'info', `Automation '${auto.name}' resumed.`);
    }
  }

  public cancelJob(jobId: string): void {
    this.executionQueue.cancelJob(jobId);
  }

  public getExecutionQueue(): ExecutionQueueItem[] {
    return this.executionQueue.getQueue();
  }

  public getActiveJobs(): ExecutionQueueItem[] {
    return this.executionQueue.getActiveJobs();
  }

  public getHistory(automationId?: string): ExecutionQueueItem[] {
    return this.historyStore.getHistory(automationId);
  }

  public getLogs(automationId?: string): AutomationLog[] {
    return this.historyStore.getLogs(automationId);
  }

  public getMetrics(): AutomationMetrics {
    const all = this.getAllAutomations();
    const active = all.filter((a) => a.enabled).length;
    const queuedCount = this.executionQueue.getQueue().length + this.executionQueue.getActiveJobs().length;
    return this.metricsEngine.getMetrics(all.length, active, queuedCount);
  }

  public resolveDependencies(): Automation[] {
    return DependencyResolver.resolveExecutionOrder(this.getAllAutomations());
  }
}
