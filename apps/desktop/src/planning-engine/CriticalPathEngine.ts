import { PlanTask, PlanStage } from './types';

export class CriticalPathEngine {
  public static calculateCriticalPath(stages: PlanStage[]): {
    criticalPathTaskIds: string[];
    totalHours: number;
  } {
    const allTasks: PlanTask[] = [];
    stages.forEach((s) => allTasks.push(...s.tasks));

    if (allTasks.length === 0) {
      return { criticalPathTaskIds: [], totalHours: 0 };
    }

    const taskMap = new Map<string, PlanTask>();
    allTasks.forEach((t) => taskMap.set(t.id, t));

    // Calculate earliest start and finish times
    const durationMap = new Map<string, number>();
    allTasks.forEach((t) => durationMap.set(t.id, t.estimatedDurationHours || 1));

    // Dynamic programming for longest path (critical path)
    const memo = new Map<string, { length: number; path: string[] }>();

    const getLongestPath = (taskId: string): { length: number; path: string[] } => {
      if (memo.has(taskId)) return memo.get(taskId)!;

      const task = taskMap.get(taskId);
      const duration = durationMap.get(taskId) || 1;

      if (!task || !task.dependencies || task.dependencies.length === 0) {
        const res = { length: duration, path: [taskId] };
        memo.set(taskId, res);
        return res;
      }

      let maxDepLength = 0;
      let maxDepPath: string[] = [];

      task.dependencies.forEach((depId) => {
        const depResult = getLongestPath(depId);
        if (depResult.length > maxDepLength) {
          maxDepLength = depResult.length;
          maxDepPath = depResult.path;
        }
      });

      const res = {
        length: maxDepLength + duration,
        path: [...maxDepPath, taskId],
      };

      memo.set(taskId, res);
      return res;
    };

    let overallMaxLength = 0;
    let overallCriticalPath: string[] = [];

    allTasks.forEach((t) => {
      const res = getLongestPath(t.id);
      if (res.length > overallMaxLength) {
        overallMaxLength = res.length;
        overallCriticalPath = res.path;
      }
    });

    return {
      criticalPathTaskIds: overallCriticalPath,
      totalHours: overallMaxLength,
    };
  }
}
