export type PlanType =
  | 'mission'
  | 'project'
  | 'department'
  | 'workflow'
  | 'agent'
  | 'automation'
  | 'deployment'
  | 'recovery'
  | 'incident';

export type PlanStatus =
  | 'draft'
  | 'approved'
  | 'optimizing'
  | 'executing'
  | 'completed'
  | 'replanned'
  | 'failed';

export type AssignedRuntimeType = 'agent' | 'workflow' | 'automation' | 'connector';

export interface PlanTask {
  id: string;
  stageId: string;
  title: string;
  description: string;
  assignedRuntime: AssignedRuntimeType;
  assignedEntityId?: string; // e.g. agentId or workflowId
  dependencies: string[]; // task IDs this task depends on
  estimatedDurationHours: number;
  priority: number;
  riskScore: number; // 0 to 100
  successCriteria: string;
  completed?: boolean;
}

export interface PlanStage {
  id: string;
  name: string;
  order: number;
  tasks: PlanTask[];
}

export interface PlanMilestone {
  id: string;
  title: string;
  targetStageId: string;
  deliverableSummary: string;
  dueDate: string;
  completed?: boolean;
}

export interface PlanTemplate {
  id: string;
  name: string;
  planType: PlanType;
  description: string;
  defaultStages: PlanStage[];
  defaultMilestones: PlanMilestone[];
}

export interface ExecutionPlan {
  id: string;
  title: string;
  planType: PlanType;
  decisionId?: string;
  goal: string;
  stages: PlanStage[];
  milestones: PlanMilestone[];
  criticalPathTaskIds: string[];
  totalEstimatedHours: number;
  riskScore: number; // 0 to 100
  optimizationScore: number; // 0 to 100
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  replanCount?: number;
}

export interface PlanMetrics {
  totalGeneratedPlans: number;
  averagePlanningLatencyMs: number;
  averageOptimizationScore: number;
  averageRiskScore: number;
  totalEstimatedHoursAllPlans: number;
  averageCriticalPathLength: number;
  planSuccessRatePercent: number;
}

export interface PlanningEvent {
  id: string;
  type:
    | 'PlanCreated'
    | 'PlanGeneratedFromDecision'
    | 'PlanOptimized'
    | 'CriticalPathCalculated'
    | 'PlanReplanned'
    | 'PlanStatusUpdated'
    | 'MilestoneCompleted';
  planId: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
