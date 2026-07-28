export type FailureType =
  | 'runtime_crash'
  | 'connector_failure'
  | 'timeout'
  | 'deadlock'
  | 'resource_exhaustion'
  | 'network_failure'
  | 'permission_failure'
  | 'policy_failure'
  | 'event_bus_failure'
  | 'storage_failure';

export type RecoveryStrategy =
  | 'retry'
  | 'restart_runtime'
  | 'resume'
  | 'rollback'
  | 'checkpoint_restore'
  | 'snapshot_restore'
  | 'failover'
  | 'escalation'
  | 'manual_intervention';

export type CircuitBreakerState = 'closed' | 'open' | 'half_open';

export interface CircuitBreakerStatus {
  targetRuntime: string;
  state: CircuitBreakerState;
  failureCount: number;
  successThreshold: number;
  lastStateChangeAt: string;
}

export interface CheckpointRecord {
  id: string;
  runtimeId: string;
  description: string;
  snapshotState: Record<string, unknown>;
  createdAt: string;
}

export interface SnapshotRecord {
  id: string;
  version: string;
  systemState: Record<string, unknown>;
  createdAt: string;
  restoredCount: number;
}

export interface RecoveryJournalEntry {
  id: string;
  runtimeId: string;
  failureType: FailureType;
  strategyUsed: RecoveryStrategy;
  result: 'success' | 'failed';
  reason: string;
  durationMs: number;
  timestamp: string;
}

export interface ResilienceMetrics {
  recoverySuccessRatePercent: number;
  meanTimeToRecoveryMs: number; // MTTR
  runtimeRestartsCount: number;
  totalRetryCount: number;
  circuitBreakerActivationsCount: number;
  checkpointCount: number;
  snapshotCount: number;
  failureRatePercent: number;
  platformAvailabilityPercent: number;
}

export interface ResilienceEvent {
  id: string;
  type:
    | 'FailureDetected'
    | 'RecoveryStarted'
    | 'RecoveryCompleted'
    | 'RecoveryFailed'
    | 'CircuitBreakerOpened'
    | 'CircuitBreakerReset'
    | 'CheckpointCreated'
    | 'CheckpointRestored'
    | 'RuntimeRestarted';
  runtimeId: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
