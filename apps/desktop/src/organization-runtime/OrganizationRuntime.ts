import { OrgEvent } from './types';
import { OrganizationRegistry } from './OrganizationRegistry';
import { RoleRegistry } from './RoleRegistry';
import { EmployeeRegistry } from './EmployeeRegistry';
import { AgentMembershipRegistry } from './AgentMembershipRegistry';
import { PolicyEngine } from './PolicyEngine';
import { PermissionEngine } from './PermissionEngine';
import { ResourceRegistry } from './ResourceRegistry';
import { DelegationEngine } from './DelegationEngine';
import { EscalationEngine } from './EscalationEngine';

export type OrgEventListener = (event: OrgEvent) => void;

export class OrganizationRuntime {
  private static instance: OrganizationRuntime;
  private orgRegistry = OrganizationRegistry.getInstance();
  private roleRegistry = RoleRegistry.getInstance();
  private employeeRegistry = EmployeeRegistry.getInstance();
  private agentMembershipRegistry = AgentMembershipRegistry.getInstance();
  private policyEngine = PolicyEngine.getInstance();
  private permissionEngine = PermissionEngine.getInstance();
  private resourceRegistry = ResourceRegistry.getInstance();
  private delegationEngine = DelegationEngine.getInstance();
  private escalationEngine = EscalationEngine.getInstance();

  private listeners = new Set<OrgEventListener>();
  private eventLog: OrgEvent[] = [];

  private constructor() {
    this.emitEvent('OrganizationCreated', { id: 'org_enterprise', name: 'Sidra Enterprise Global' });
  }

  public static getInstance(): OrganizationRuntime {
    if (!OrganizationRuntime.instance) {
      OrganizationRuntime.instance = new OrganizationRuntime();
    }
    return OrganizationRuntime.instance;
  }

  public subscribe(listener: OrgEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(type: OrgEvent['type'], payload?: Record<string, unknown>): void {
    const event: OrgEvent = {
      id: `EV-ORG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): OrgEvent[] {
    return [...this.eventLog];
  }

  public validatePermission(subjectId: string, permission: string): boolean {
    return this.permissionEngine.hasPermission(subjectId, permission);
  }

  public evaluatePolicy(category: string, context: Record<string, unknown>): 'allow' | 'deny' | 'require_approval' {
    return this.policyEngine.evaluate(category, context);
  }

  public delegateAuthority(delegatorId: string, delegateeId: string, type: 'Mission' | 'Approval' | 'Authority') {
    const del = this.delegationEngine.createDelegation(delegatorId, delegateeId, type);
    this.emitEvent('DelegationCreated', { id: del.id, delegatorId, delegateeId });
    return del;
  }

  public escalate(triggerType: 'Timeout' | 'Failure' | 'Priority', targetRoleId = 'role_director') {
    const esc = this.escalationEngine.triggerEscalation(triggerType, targetRoleId);
    this.emitEvent('EscalationTriggered', { id: esc.id, triggerType, targetRoleId });
    return esc;
  }

  public getOrgRegistry(): OrganizationRegistry {
    return this.orgRegistry;
  }

  public getRoleRegistry(): RoleRegistry {
    return this.roleRegistry;
  }

  public getEmployeeRegistry(): EmployeeRegistry {
    return this.employeeRegistry;
  }

  public getAgentMembershipRegistry(): AgentMembershipRegistry {
    return this.agentMembershipRegistry;
  }

  public getResourceRegistry(): ResourceRegistry {
    return this.resourceRegistry;
  }
}
