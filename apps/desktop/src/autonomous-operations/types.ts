export type RecommendationType =
  | 'performance'
  | 'resource'
  | 'retry'
  | 'connector'
  | 'policy'
  | 'security'
  | 'capacity'
  | 'cache'
  | 'scheduling';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';

export interface RecommendationItem {
  id: string;
  title: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  targetRuntime: string;
  rationale: string;
  impactScore: number; // 0-100
  autoApplyable: boolean;
  status: 'pending' | 'applied' | 'dismissed';
  createdAt: string;
}

export interface RuntimeScoreboardEntry {
  runtimeId: string;
  healthScore: number; // 0-100
  efficiencyScore: number; // 0-100
  bottleneckRisk: 'low' | 'medium' | 'high';
  trend: 'improving' | 'stable' | 'degrading';
}

export interface LearningEvent {
  id: string;
  eventType: string;
  lessonLearned: string;
  confidenceScore: number; // 0-100
  timestamp: string;
}

export interface BaselineComparison {
  parameter: string;
  currentVal: number | string;
  baselineVal: number | string;
  deltaPercent: number;
  status: 'optimal' | 'suboptimal' | 'critical';
}

export interface OperationsMetrics {
  optimizationCount: number;
  recommendationsAcceptedCount: number;
  predictionAccuracyPercent: number;
  overallRuntimeScore: number; // 0-100
  operationalEfficiencyPercent: number;
  improvementPercent: number;
  trendAccuracyPercent: number;
  learningEventsCount: number;
}

export interface OperationsEvent {
  id: string;
  type:
    | 'AnalysisCompleted'
    | 'RecommendationGenerated'
    | 'OptimizationApplied'
    | 'LearningRecorded'
    | 'AnomalyDetected';
  targetRuntime?: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
