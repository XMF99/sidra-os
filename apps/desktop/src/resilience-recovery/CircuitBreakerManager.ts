import { CircuitBreakerStatus } from './types';

export class CircuitBreakerManager {
  private breakers = new Map<string, CircuitBreakerStatus>();

  constructor() {
    this.seedDefaultBreakers();
  }

  private seedDefaultBreakers(): void {
    const runtimes = [
      'mission',
      'workflow',
      'automation',
      'agent',
      'knowledge',
      'decision',
      'planning',
      'execution',
      'resource',
      'connector',
    ];

    const now = new Date().toISOString();
    runtimes.forEach((rt) => {
      this.breakers.set(rt, {
        targetRuntime: rt,
        state: 'closed',
        failureCount: 0,
        successThreshold: 3,
        lastStateChangeAt: now,
      });
    });
  }

  public recordFailure(targetRuntime: string, failureThreshold = 3): CircuitBreakerStatus {
    let status = this.breakers.get(targetRuntime);
    if (!status) {
      status = {
        targetRuntime,
        state: 'closed',
        failureCount: 0,
        successThreshold: 3,
        lastStateChangeAt: new Date().toISOString(),
      };
      this.breakers.set(targetRuntime, status);
    }

    status.failureCount += 1;
    if (status.failureCount >= failureThreshold && status.state !== 'open') {
      status.state = 'open';
      status.lastStateChangeAt = new Date().toISOString();
    }

    return status;
  }

  public recordSuccess(targetRuntime: string): CircuitBreakerStatus {
    const status = this.breakers.get(targetRuntime);
    if (status) {
      if (status.state === 'half_open') {
        status.state = 'closed';
        status.failureCount = 0;
        status.lastStateChangeAt = new Date().toISOString();
      } else if (status.state === 'closed') {
        status.failureCount = Math.max(0, status.failureCount - 1);
      }
    }
    return status!;
  }

  public resetCircuitBreaker(targetRuntime: string): CircuitBreakerStatus {
    const status = this.breakers.get(targetRuntime) || {
      targetRuntime,
      state: 'closed',
      failureCount: 0,
      successThreshold: 3,
      lastStateChangeAt: new Date().toISOString(),
    };

    status.state = 'closed';
    status.failureCount = 0;
    status.lastStateChangeAt = new Date().toISOString();
    this.breakers.set(targetRuntime, status);

    return status;
  }

  public getStatus(targetRuntime: string): CircuitBreakerStatus | undefined {
    return this.breakers.get(targetRuntime);
  }

  public getAllBreakers(): CircuitBreakerStatus[] {
    return Array.from(this.breakers.values());
  }
}
