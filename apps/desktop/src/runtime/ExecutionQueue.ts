import { QueueItem } from './types';

export class ExecutionQueue {
  private queue: QueueItem[] = [];

  public enqueue(item: QueueItem): void {
    // Prevent duplicate queueing
    if (this.queue.some((q) => q.missionId === item.missionId)) {
      return;
    }
    this.queue.push(item);
    // Sort descending by priority (higher priority number first)
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  public dequeue(): QueueItem | undefined {
    return this.queue.shift();
  }

  public peek(): QueueItem | undefined {
    return this.queue[0];
  }

  public cancel(missionId: string): boolean {
    const idx = this.queue.findIndex((q) => q.missionId === missionId);
    if (idx !== -1) {
      this.queue.splice(idx, 1);
      return true;
    }
    return false;
  }

  public inspect(): QueueItem[] {
    return [...this.queue];
  }

  public clear(): void {
    this.queue = [];
  }
}
