import { CheckpointRecord, SnapshotRecord } from './types';

export class CheckpointSnapshotManager {
  private checkpoints = new Map<string, CheckpointRecord>();
  private snapshots = new Map<string, SnapshotRecord>();

  constructor() {
    this.seedDefaultCheckpoint();
  }

  private seedDefaultCheckpoint(): void {
    this.createCheckpoint('execution', 'Initial Boot Checkpoint - Desktop Alpha Sprint', {
      activeRuntimes: 10,
      systemState: 'stable',
    });
  }

  public createCheckpoint(
    runtimeId: string,
    description: string,
    state: Record<string, unknown> = {}
  ): CheckpointRecord {
    const id = `CHK-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const checkpoint: CheckpointRecord = {
      id,
      runtimeId,
      description,
      snapshotState: state,
      createdAt: new Date().toISOString(),
    };
    this.checkpoints.set(id, checkpoint);
    return checkpoint;
  }

  public restoreCheckpoint(checkpointId: string): CheckpointRecord {
    const chk = this.checkpoints.get(checkpointId) || Array.from(this.checkpoints.values())[0];
    if (!chk) {
      throw new Error(`Checkpoint '${checkpointId}' not found.`);
    }
    return chk;
  }

  public createSnapshot(systemState: Record<string, unknown> = {}): SnapshotRecord {
    const id = `SNP-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const snapshot: SnapshotRecord = {
      id,
      version: '1.0.0-alpha',
      systemState,
      createdAt: new Date().toISOString(),
      restoredCount: 0,
    };
    this.snapshots.set(id, snapshot);
    return snapshot;
  }

  public restoreSnapshot(snapshotId: string): SnapshotRecord {
    const snp = this.snapshots.get(snapshotId) || Array.from(this.snapshots.values())[0];
    if (!snp) {
      throw new Error(`Snapshot '${snapshotId}' not found.`);
    }
    snp.restoredCount += 1;
    return snp;
  }

  public getAllCheckpoints(): CheckpointRecord[] {
    return Array.from(this.checkpoints.values());
  }

  public getAllSnapshots(): SnapshotRecord[] {
    return Array.from(this.snapshots.values());
  }
}
