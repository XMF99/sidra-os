export type RuntimeAuditStatus = 'certified' | 'passed' | 'warning' | 'failed';

export interface RuntimeAuditEntry {
  runtimeId: string;
  name: string;
  epicNumber: number;
  status: RuntimeAuditStatus;
  boundaryIsolationVerified: boolean;
  eventBusIntegrationVerified: boolean;
  publicApisVerified: boolean;
  metricsExportedVerified: boolean;
  notes: string;
}

export interface IntegrationFlowTestResult {
  stepIndex: number;
  flowName: string;
  fromRuntime: string;
  toRuntime: string;
  passed: boolean;
  latencyMs: number;
  details: string;
}

export interface PerformanceBenchmarkResult {
  metricName: string;
  measuredValue: number | string;
  targetThreshold: number | string;
  passed: boolean;
  unit: string;
}

export interface CertificationSuiteResult {
  certifiedAt: string;
  overallReadinessScorePercent: number; // 0-100
  totalRuntimesAudited: number;
  passedRuntimesCount: number;
  totalIntegrationFlowsTested: number;
  passedIntegrationFlowsCount: number;
  architectureBoundaryViolationsCount: number;
  securityViolationsCount: number;
  runtimes: RuntimeAuditEntry[];
  integrationTests: IntegrationFlowTestResult[];
  benchmarks: PerformanceBenchmarkResult[];
}
