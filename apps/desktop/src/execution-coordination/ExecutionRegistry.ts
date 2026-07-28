import { ExecutionSession, FailureRecoveryAction } from './types';

export class ExecutionRegistry {
  private static instance: ExecutionRegistry;
  private sessions = new Map<string, ExecutionSession>();
  private recoveryActions: FailureRecoveryAction[] = [];

  private constructor() {}

  public static getInstance(): ExecutionRegistry {
    if (!ExecutionRegistry.instance) {
      ExecutionRegistry.instance = new ExecutionRegistry();
    }
    return ExecutionRegistry.instance;
  }

  public storeSession(session: ExecutionSession): void {
    this.sessions.set(session.id, session);
  }

  public getSession(id: string): ExecutionSession | undefined {
    return this.sessions.get(id);
  }

  public getAllSessions(): ExecutionSession[] {
    return Array.from(this.sessions.values());
  }

  public addRecoveryAction(action: FailureRecoveryAction): void {
    this.recoveryActions.unshift(action);
    if (this.recoveryActions.length > 200) {
      this.recoveryActions.pop();
    }
  }

  public getRecoveryActions(): FailureRecoveryAction[] {
    return [...this.recoveryActions];
  }
}
