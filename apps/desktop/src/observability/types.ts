export type SystemHealthState = 'healthy' | 'warning' | 'degraded' | 'critical' | 'offline' | 'unknown';

export interface RuntimeHealthReport {
  runtimeId: string;
  runtimeName: string;
  status: SystemHealthState;
  latencyMs: number;
  errorCount: number;
  heartbeatAt: string;
  uptimePercent: number;
}

export interface TelemetryMetric {
  id: string;
  name: string;
  metricType: 'gauge' | 'counter' | 'histogram';
  sourceRuntime: string;
  value: number;
  unit: string;
  timestamp: string;
  tags?: Record<string, string>;
}

export interface TraceSpan {
  id: string;
  traceId: string;
  parentSpanId?: string;
  operationName: string;
  sourceRuntime: string;
  startTimeMs: number;
  endTimeMs?: number;
  durationMs?: number;
  status: 'ok' | 'error';
  tags?: Record<string, string>;
  errorReason?: string;
}

export interface TelemetryAlert {
  id: string;
  ruleName: string;
  severity: 'info' | 'warning' | 'critical';
  sourceRuntime: string;
  message: string;
  triggeredAt: string;
  resolvedAt?: string;
  active: boolean;
}

export interface DependencyNode {
  id: string;
  label: string;
  type: 'runtime' | 'engine' | 'storage' | 'connector';
  status: SystemHealthState;
  dependencies: string[];
}

export interface ObservabilityMetrics {
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  gpuUsagePercent: number;
  overallSystemHealth: SystemHealthState;
  activeAlertsCount: number;
  systemUptimePercent: number;
  averageRuntimeLatencyMs: number;
  totalTracesCount: number;
  totalMetricsCollected: number;
}

export interface ObservabilityEvent {
  id: string;
  type: 'HealthChanged' | 'AlertTriggered' | 'AlertResolved' | 'SpanCompleted' | 'MetricRecorded';
  sourceRuntime: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
