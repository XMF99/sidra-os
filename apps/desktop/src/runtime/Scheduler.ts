import { ExecutionQueue } from './ExecutionQueue';
import { QueueItem, MissionRunRecord } from './types';

export class CycleDependencyError extends Error {
  constructor(missionId: string) {
    super(`Cycle detected in mission dependency graph for mission '${missionId}'`);
    this.name = 'CycleDependencyError';
  }
}

export class Scheduler {
  private queue: ExecutionQueue;
  private isPaused: boolean = false;

  constructor(queue: ExecutionQueue) {
    this.queue = queue;
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  public isSchedulerPaused(): boolean {
    return this.isPaused;
  }

  // Detect DAG cycles using Depth-First Search (DFS)
  public validateNoCycles(missionId: string, dependencies: string[], _allRecords?: Map<string, MissionRunRecord>): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (currId: string) => {
      visited.add(currId);
      recursionStack.add(currId);

      const itemDependencies = currId === missionId ? dependencies : [];
      for (const depId of itemDependencies) {
        if (!visited.has(depId)) {
          dfs(depId);
        } else if (recursionStack.has(depId)) {
          throw new CycleDependencyError(currId);
        }
      }

      recursionStack.delete(currId);
    };

    dfs(missionId);
  }

  // Select the next runnable mission whose dependencies are all in 'completed' state
  public getNextRunnableMission(allRecords: Map<string, MissionRunRecord>): QueueItem | undefined {
    if (this.isPaused) return undefined;

    const items = this.queue.inspect();
    for (const item of items) {
      const depsSatisfied = item.dependencies.every((depId) => {
        const record = allRecords.get(depId);
        return record && record.state === 'completed';
      });

      if (depsSatisfied) {
        return item;
      }
    }

    return undefined;
  }
}
