import { EscalationRecord } from './types';

export class EscalationEngine {
  private static instance: EscalationEngine;
  private escalations: EscalationRecord[] = [];

  public static getInstance(): EscalationEngine {
    if (!EscalationEngine.instance) {
      EscalationEngine.instance = new EscalationEngine();
    }
    return EscalationEngine.instance;
  }

  public triggerEscalation(
    triggerType: 'Timeout' | 'Failure' | 'Priority',
    targetRoleId = 'role_director'
  ): EscalationRecord {
    const record: EscalationRecord = {
      id: `esc_${Date.now()}`,
      triggerType,
      targetRoleId,
      escalatedAt: new Date().toISOString(),
      resolved: false,
    };
    this.escalations.push(record);
    return record;
  }

  public getUnresolved(): EscalationRecord[] {
    return this.escalations.filter((e) => !e.resolved);
  }
}
