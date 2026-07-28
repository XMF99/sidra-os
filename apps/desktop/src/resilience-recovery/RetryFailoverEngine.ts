import { FailureType, RecoveryStrategy } from './types';

export class RetryFailoverEngine {
  public static selectStrategy(failureType: FailureType): RecoveryStrategy {
    switch (failureType) {
      case 'runtime_crash':
        return 'restart_runtime';
      case 'connector_failure':
        return 'retry';
      case 'timeout':
        return 'retry';
      case 'deadlock':
        return 'checkpoint_restore';
      case 'resource_exhaustion':
        return 'failover';
      case 'network_failure':
        return 'retry';
      case 'permission_failure':
        return 'escalation';
      case 'policy_failure':
        return 'manual_intervention';
      default:
        return 'retry';
    }
  }

  public static calculateBackoffMs(attempt: number, baseMs = 100): number {
    return Math.min(10000, baseMs * Math.pow(2, attempt));
  }
}
