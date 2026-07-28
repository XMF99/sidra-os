import { AutomationLog, ExecutionQueueItem } from './types';

export class AutomationHistoryStore {
  private static instance: AutomationHistoryStore;
  private history: ExecutionQueueItem[] = [];
  private logs: AutomationLog[] = [];

  public static getInstance(): AutomationHistoryStore {
    if (!AutomationHistoryStore.instance) {
      AutomationHistoryStore.instance = new AutomationHistoryStore();
    }
    return AutomationHistoryStore.instance;
  }

  public recordJob(job: ExecutionQueueItem): void {
    const existingIndex = this.history.findIndex((j) => j.jobId === job.jobId);
    if (existingIndex >= 0) {
      this.history[existingIndex] = { ...job };
    } else {
      this.history.unshift({ ...job });
    }

    if (this.history.length > 200) {
      this.history.pop();
    }
  }

  public addLog(automationId: string, jobId: string, level: 'info' | 'warn' | 'error', message: string): void {
    this.logs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      automationId,
      jobId,
      level,
      message,
      timestamp: new Date().toISOString(),
    });
    if (this.logs.length > 500) {
      this.logs.pop();
    }
  }

  public getHistory(automationId?: string): ExecutionQueueItem[] {
    if (automationId) {
      return this.history.filter((h) => h.automationId === automationId);
    }
    return [...this.history];
  }

  public getLogs(automationId?: string): AutomationLog[] {
    if (automationId) {
      return this.logs.filter((l) => l.automationId === automationId);
    }
    return [...this.logs];
  }
}
