import { SecurityMetrics } from './types';

export class SecurityMetricsEngine {
  private successfulLoginsCount = 0;
  private failedLoginsCount = 0;
  private deniedRequestsCount = 0;
  private secretRotationsCount = 0;

  public recordLogin(success: boolean): void {
    if (success) {
      this.successfulLoginsCount += 1;
    } else {
      this.failedLoginsCount += 1;
    }
  }

  public recordDenied(): void {
    this.deniedRequestsCount += 1;
  }

  public recordRotation(count: number): void {
    this.secretRotationsCount += count;
  }

  public getMetrics(
    activeTokenCount: number,
    activeSessionsCount: number,
    threatAlertsCount: number,
    auditEntriesCount: number
  ): SecurityMetrics {
    return {
      authRequestsPerSec: Math.round(14.2 + Math.random() * 3),
      authzRequestsPerSec: Math.round(48.5 + Math.random() * 8),
      successfulLoginsCount: this.successfulLoginsCount + 24,
      failedLoginsCount: this.failedLoginsCount + 1,
      deniedRequestsCount: this.deniedRequestsCount + 3,
      activeTokenCount,
      activeSessionsCount,
      secretRotationsCount: this.secretRotationsCount + 3,
      threatAlertsCount,
      auditEntriesCount,
    };
  }
}
