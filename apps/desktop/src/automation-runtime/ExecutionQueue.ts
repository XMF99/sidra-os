import { ExecutionQueueItem, Automation } from './types';
import { ActionExecutor } from './ActionExecutor';

export type QueueItemListener = (item: ExecutionQueueItem) => void;

export class ExecutionQueue {
  private static instance: ExecutionQueue;
  private queue: ExecutionQueueItem[] = [];
  private activeJobs = new Map<string, ExecutionQueueItem>();
  private maxConcurrentJobs = 5;
  private isProcessing = false;
  private actionExecutor = ActionExecutor.getInstance();
  private listeners = new Set<QueueItemListener>();

  public static getInstance(): ExecutionQueue {
    if (!ExecutionQueue.instance) {
      ExecutionQueue.instance = new ExecutionQueue();
    }
    return ExecutionQueue.instance;
  }

  public subscribe(listener: QueueItemListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(item: ExecutionQueueItem): void {
    this.listeners.forEach((fn) => fn({ ...item }));
  }

  public enqueue(automation: Automation): ExecutionQueueItem {
    const item: ExecutionQueueItem = {
      jobId: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      automationId: automation.id,
      automationName: automation.name,
      state: 'queued',
      priority: automation.priority,
      actions: [...automation.actions],
      currentStepIndex: 0,
      totalSteps: automation.actions.length,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
      logs: [`Enqueued job for automation '${automation.name}' (${automation.priority} priority)`],
    };

    this.queue.push(item);
    this.sortQueue();
    this.notify(item);
    this.processQueue();
    return item;
  }

  private sortQueue(): void {
    const priorityWeight: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };
    this.queue.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
  }

  public getQueue(): ExecutionQueueItem[] {
    return [...this.queue];
  }

  public getActiveJobs(): ExecutionQueueItem[] {
    return Array.from(this.activeJobs.values());
  }

  public pauseJob(jobId: string): void {
    const job = this.activeJobs.get(jobId) || this.queue.find((j) => j.jobId === jobId);
    if (job) {
      job.state = 'paused';
      job.logs.push('Job execution paused by user request');
      this.notify(job);
    }
  }

  public cancelJob(jobId: string): void {
    const job = this.activeJobs.get(jobId) || this.queue.find((j) => j.jobId === jobId);
    if (job) {
      job.state = 'cancelled';
      job.finishedAt = new Date().toISOString();
      job.logs.push('Job execution cancelled');
      this.activeJobs.delete(jobId);
      this.queue = this.queue.filter((j) => j.jobId !== jobId);
      this.notify(job);
    }
  }

  public async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0 && this.activeJobs.size < this.maxConcurrentJobs) {
      const job = this.queue.shift();
      if (!job) break;

      if (job.state === 'cancelled' || job.state === 'paused') continue;

      this.activeJobs.set(job.jobId, job);
      job.state = 'running';
      job.startedAt = new Date().toISOString();
      job.logs.push(`Started execution of step 1 / ${job.totalSteps}`);
      this.notify(job);

      this.executeJobAsync(job);
    }

    this.isProcessing = false;
  }

  private async executeJobAsync(job: ExecutionQueueItem): Promise<void> {
    try {
      for (let i = 0; i < job.actions.length; i++) {
        if (job.state === 'cancelled' || job.state === 'paused') break;

        job.currentStepIndex = i;
        const action = job.actions[i];
        job.logs.push(`Executing action step ${i + 1} (${action.type})`);
        this.notify(job);

        await this.actionExecutor.executeAction(action);
        job.logs.push(`Completed step ${i + 1}`);
      }

      if (job.state !== 'cancelled' && job.state !== 'paused') {
        job.state = 'completed';
        job.finishedAt = new Date().toISOString();
        job.logs.push('All steps executed successfully');
      }
    } catch (err) {
      job.state = 'failed';
      job.finishedAt = new Date().toISOString();
      job.error = (err as Error).message;
      job.logs.push(`Job failed: ${job.error}`);
    } finally {
      this.activeJobs.delete(job.jobId);
      this.notify(job);
      this.processQueue();
    }
  }
}
