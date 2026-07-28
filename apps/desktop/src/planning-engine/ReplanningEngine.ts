import { ExecutionPlan } from './types';
import { CriticalPathEngine } from './CriticalPathEngine';
import { PlanOptimizationEngine } from './PlanOptimizationEngine';

export class ReplanningEngine {
  public static replan(
    plan: ExecutionPlan,
    reason: string
  ): ExecutionPlan {
    const replanCount = (plan.replanCount || 0) + 1;

    // Reset failed tasks to pending with fallback runtimes
    const updatedStages = plan.stages.map((stage) => ({
      ...stage,
      tasks: stage.tasks.map((task) => {
        if (task.title.toLowerCase().includes('failed') || task.title.toLowerCase().includes('fallback')) {
          return {
            ...task,
            assignedRuntime: 'agent' as const,
            riskScore: Math.max(5, task.riskScore - 10),
          };
        }
        return task;
      }),
    }));

    const criticalPath = CriticalPathEngine.calculateCriticalPath(updatedStages);
    const optimization = PlanOptimizationEngine.optimizePlan(updatedStages);

    return {
      ...plan,
      goal: `${plan.goal} (Replanned: ${reason})`,
      stages: optimization.optimizedStages,
      criticalPathTaskIds: criticalPath.criticalPathTaskIds,
      totalEstimatedHours: criticalPath.totalHours,
      optimizationScore: optimization.optimizationScore,
      riskScore: optimization.overallRiskScore,
      status: 'replanned',
      replanCount,
      updatedAt: new Date().toISOString(),
    };
  }
}
