import { CircuitBreakerState } from './types';

export class CircuitBreaker {
  private static instance: CircuitBreaker;
  private states = new Map<string, CircuitBreakerState>();
  private failureThreshold = 5;
  private cooldownMs = 15000;

  public static getInstance(): CircuitBreaker {
    if (!CircuitBreaker.instance) {
      CircuitBreaker.instance = new CircuitBreaker();
    }
    return CircuitBreaker.instance;
  }

  public getState(connectorId: string): CircuitBreakerState {
    let cb = this.states.get(connectorId);
    if (!cb) {
      cb = { status: 'closed', failureCount: 0 };
      this.states.set(connectorId, cb);
    }
    return cb;
  }

  public canExecute(connectorId: string): boolean {
    const cb = this.getState(connectorId);
    if (cb.status === 'closed') return true;

    if (cb.status === 'open') {
      const now = Date.now();
      if (cb.nextAttemptTime && now >= cb.nextAttemptTime) {
        cb.status = 'half-open';
        return true;
      }
      return false;
    }

    return true;
  }

  public recordSuccess(connectorId: string): void {
    const cb = this.getState(connectorId);
    cb.failureCount = 0;
    cb.status = 'closed';
    delete cb.lastFailureTime;
    delete cb.nextAttemptTime;
  }

  public recordFailure(connectorId: string): void {
    const cb = this.getState(connectorId);
    cb.failureCount += 1;
    cb.lastFailureTime = Date.now();

    if (cb.failureCount >= this.failureThreshold) {
      cb.status = 'open';
      cb.nextAttemptTime = Date.now() + this.cooldownMs;
    }
  }
}
