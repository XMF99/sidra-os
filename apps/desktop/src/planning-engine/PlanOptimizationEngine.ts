import { PlanStage, PlanTask } from './types';

export class PlanOptimizationEngine {
  public static optimizePlan(stages: PlanStage[]): {
    optimizedStages: PlanStage[];
    optimizationScore: number;
    overallRiskScore: number;
  } {
    let totalRisk = 0;
    let taskCount = 0;

    const optimizedStages = stages.map((stg) => {
      const optimizedTasks: PlanTask[] = stg.tasks.map((task) => {
        taskCount += 1;
        totalRisk += task.riskScore || 15;

        // Auto-assign runtime if unassigned
        let assignedRuntime = task.assignedRuntime;
        if (!assignedRuntime) {
          if (task.title.toLowerCase().includes('workflow') || task.title.toLowerCase().includes('process')) {
            assignedRuntime = 'workflow';
          } else if (task.title.toLowerCase().includes('automation') || task.title.toLowerCase().includes('trigger')) {
            assignedRuntime = 'automation';
          } else if (task.title.toLowerCase().includes('api') || task.title.toLowerCase().includes('connector')) {
            assignedRuntime = 'connector';
          } else {
            assignedRuntime = 'agent';
          }
        }

        return {
          ...task,
          assignedRuntime,
        };
      });

      return {
        ...stg,
        tasks: optimizedTasks,
      };
    });

    const avgRisk = taskCount > 0 ? Math.round(totalRisk / taskCount) : 15;
    const optimizationScore = Math.min(98, Math.max(65, 100 - avgRisk * 0.8 + (taskCount > 3 ? 10 : 0)));

    return {
      optimizedStages,
      optimizationScore: Math.round(optimizationScore),
      overallRiskScore: avgRisk,
    };
  }
}
