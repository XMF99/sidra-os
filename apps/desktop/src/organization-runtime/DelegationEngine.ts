import { DelegationRecord } from './types';

export class DelegationEngine {
  private static instance: DelegationEngine;
  private delegations = new Map<string, DelegationRecord>();

  public static getInstance(): DelegationEngine {
    if (!DelegationEngine.instance) {
      DelegationEngine.instance = new DelegationEngine();
    }
    return DelegationEngine.instance;
  }

  public createDelegation(
    delegatorId: string,
    delegateeId: string,
    type: 'Mission' | 'Approval' | 'Authority'
  ): DelegationRecord {
    const record: DelegationRecord = {
      id: `del_${Date.now()}`,
      delegatorId,
      delegateeId,
      type,
      active: true,
    };
    this.delegations.set(record.id, record);
    return record;
  }

  public getActiveDelegation(delegatorId: string): DelegationRecord | undefined {
    return Array.from(this.delegations.values()).find(
      (d) => d.delegatorId === delegatorId && d.active
    );
  }
}
