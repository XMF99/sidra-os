import {
  FailureType,
  RecoveryStrategy,
  CheckpointRecord,
  SnapshotRecord,
  RecoveryJournalEntry,
  ResilienceMetrics,
  ResilienceEvent,
  CircuitBreakerStatus,
} from './types';
import { CircuitBreakerManager } from './CircuitBreakerManager';
import { CheckpointSnapshotManager } from './CheckpointSnapshotManager';
import { RetryFailoverEngine } from './RetryFailoverEngine';
import { RecoveryJournalEngine } from './RecoveryJournalEngine';

export type ResilienceEventListener = (event: ResilienceEvent) => void;

export class ResilienceRecoveryEngine {
  private static instance: ResilienceRecoveryEngine;
  private breakerManager = new CircuitBreakerManager();
  private checkpointSnapshotManager = new CheckpointSnapshotManager();
  private journalEngine = new RecoveryJournalEngine();
  private listeners = new Set<ResilienceEventListener>();
  private eventLog: ResilienceEvent[] = [];

  private constructor() {
    this.seedDefaultRecoveryLogs();
  }

  public static getInstance(): ResilienceRecoveryEngine {
    if (!ResilienceRecoveryEngine.instance) {
      ResilienceRecoveryEngine.instance = new ResilienceRecoveryEngine();
    }
    return ResilienceRecoveryEngine.instance;
  }

  public subscribe(listener: ResilienceEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(type: ResilienceEvent['type'], runtimeId: string, payload?: Record<string, unknown>): void {
    const event: ResilienceEvent = {
      id: `EV-RES-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      runtimeId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    if (this.eventLog.length > 300) {
      this.eventLog.pop();
    }
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): ResilienceEvent[] {
    return [...this.eventLog];
  }

  private seedDefaultRecoveryLogs(): void {
    const defaultFailures: Array<{ runtimeId: string; failureType: FailureType; strategy: RecoveryStrategy }> = [
      { runtimeId: 'connector', failureType: 'connector_failure', strategy: 'retry' },
      { runtimeId: 'agent', failureType: 'timeout', strategy: 'retry' },
      { runtimeId: 'execution', failureType: 'deadlock', strategy: 'checkpoint_restore' },
    ];

    defaultFailures.forEach((item) => {
      this.journalEngine.logRecovery({
        id: `JRN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        runtimeId: item.runtimeId,
        failureType: item.failureType,
        strategyUsed: item.strategy,
        result: 'success',
        reason: `Automated recovery executed for '${item.failureType}' on runtime '${item.runtimeId}'.`,
        durationMs: Math.floor(20 + Math.random() * 50),
        timestamp: new Date().toISOString(),
      });
    });
  }

  public detectFailure(runtimeId: string, failureType: FailureType, reason: string): void {
    this.emitEvent('FailureDetected', runtimeId, { failureType, reason });
    const cb = this.breakerManager.recordFailure(runtimeId);
    if (cb.state === 'open') {
      this.emitEvent('CircuitBreakerOpened', runtimeId, { failureCount: cb.failureCount });
    }
    // Execute auto-recovery
    this.recover(runtimeId, failureType);
  }

  public recover(runtimeId: string, failureType: FailureType): RecoveryJournalEntry {
    const startTime = Date.now();
    this.emitEvent('RecoveryStarted', runtimeId, { failureType });

    const strategy = RetryFailoverEngine.selectStrategy(failureType);

    if (strategy === 'restart_runtime') {
      this.restartRuntime(runtimeId);
    } else if (strategy === 'checkpoint_restore') {
      const chks = this.checkpointSnapshotManager.getAllCheckpoints();
      if (chks.length > 0) {
        this.restoreCheckpoint(chks[0].id);
      }
    }

    this.breakerManager.recordSuccess(runtimeId);

    const duration = Date.now() - startTime;
    const entry: RecoveryJournalEntry = {
      id: `JRN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      runtimeId,
      failureType,
      strategyUsed: strategy,
      result: 'success',
      reason: `Executed recovery strategy '${strategy}' for failure '${failureType}' on runtime '${runtimeId}'.`,
      durationMs: duration,
      timestamp: new Date().toISOString(),
    };

    this.journalEngine.logRecovery(entry);
    this.emitEvent('RecoveryCompleted', runtimeId, { strategy, durationMs: duration });
    return entry;
  }

  public restartRuntime(runtimeId: string): void {
    this.journalEngine.recordRestart();
    this.breakerManager.resetCircuitBreaker(runtimeId);
    this.emitEvent('RuntimeRestarted', runtimeId);
  }

  public createCheckpoint(runtimeId: string, description: string): CheckpointRecord {
    const chk = this.checkpointSnapshotManager.createCheckpoint(runtimeId, description);
    this.emitEvent('CheckpointCreated', runtimeId, { checkpointId: chk.id });
    return chk;
  }

  public restoreCheckpoint(checkpointId: string): CheckpointRecord {
    const chk = this.checkpointSnapshotManager.restoreCheckpoint(checkpointId);
    this.emitEvent('CheckpointRestored', chk.runtimeId, { checkpointId: chk.id });
    return chk;
  }

  public createSnapshot(): SnapshotRecord {
    return this.checkpointSnapshotManager.createSnapshot({ status: 'healthy', timestamp: new Date().toISOString() });
  }

  public restoreSnapshot(snapshotId: string): SnapshotRecord {
    return this.checkpointSnapshotManager.restoreSnapshot(snapshotId);
  }

  public getRecoveryHistory(): RecoveryJournalEntry[] {
    return this.journalEngine.getHistory();
  }

  public getAllCircuitBreakers(): CircuitBreakerStatus[] {
    return this.breakerManager.getAllBreakers();
  }

  public getAllCheckpoints(): CheckpointRecord[] {
    return this.checkpointSnapshotManager.getAllCheckpoints();
  }

  public getAllSnapshots(): SnapshotRecord[] {
    return this.checkpointSnapshotManager.getAllSnapshots();
  }

  public getMetrics(): ResilienceMetrics {
    const cbOpenCount = this.breakerManager.getAllBreakers().filter((b) => b.state === 'open').length;
    return this.journalEngine.getMetrics(
      cbOpenCount,
      this.checkpointSnapshotManager.getAllCheckpoints().length,
      this.checkpointSnapshotManager.getAllSnapshots().length
    );
  }
}
