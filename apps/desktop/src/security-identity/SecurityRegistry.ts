import { IdentityRecord, ThreatIndicator, SecurityAuditEvent } from './types';

export class SecurityRegistry {
  private static instance: SecurityRegistry;
  private identities = new Map<string, IdentityRecord>();
  private threatIndicators: ThreatIndicator[] = [];
  private auditLog: SecurityAuditEvent[] = [];

  private constructor() {
    this.seedDefaultIdentities();
  }

  public static getInstance(): SecurityRegistry {
    if (!SecurityRegistry.instance) {
      SecurityRegistry.instance = new SecurityRegistry();
    }
    return SecurityRegistry.instance;
  }

  private seedDefaultIdentities(): void {
    const defaults: IdentityRecord[] = [
      {
        id: 'usr_admin',
        name: 'Founding Principal Administrator',
        identityType: 'administrator',
        roles: ['administrator'],
        permissions: ['*'],
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
      {
        id: 'usr_dev',
        name: 'Lead System Developer',
        identityType: 'developer_identity',
        roles: ['developer'],
        permissions: ['runtime:*', 'connector:*', 'mission:read'],
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
      {
        id: 'agent_code_expert',
        name: 'Autonomous Code Expert Agent',
        identityType: 'ai_agent',
        roles: ['ai_worker'],
        permissions: ['agent:execute', 'connector:execute', 'knowledge:read'],
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'svc_execution_coordinator',
        name: 'Execution Coordination Service Account',
        identityType: 'service_account',
        roles: ['service_worker'],
        permissions: ['execution:*', 'resource:allocate', 'eventbus:publish'],
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];

    defaults.forEach((id) => this.identities.set(id.id, id));
  }

  public getIdentity(id: string): IdentityRecord | undefined {
    return this.identities.get(id);
  }

  public getAllIdentities(): IdentityRecord[] {
    return Array.from(this.identities.values());
  }

  public logAudit(event: SecurityAuditEvent): void {
    this.auditLog.unshift(event);
    if (this.auditLog.length > 1000) {
      this.auditLog.pop();
    }
  }

  public getAuditLog(): SecurityAuditEvent[] {
    return [...this.auditLog];
  }

  public addThreatIndicator(threat: ThreatIndicator): void {
    this.threatIndicators.unshift(threat);
    if (this.threatIndicators.length > 200) {
      this.threatIndicators.pop();
    }
  }

  public getThreatIndicators(): ThreatIndicator[] {
    return [...this.threatIndicators];
  }
}
