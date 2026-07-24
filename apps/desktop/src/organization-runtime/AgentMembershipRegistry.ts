import { AgentMembership } from './types';

export class AgentMembershipRegistry {
  private static instance: AgentMembershipRegistry;
  private memberships = new Map<string, AgentMembership>();

  private constructor() {
    this.registerDefaultMemberships();
  }

  public static getInstance(): AgentMembershipRegistry {
    if (!AgentMembershipRegistry.instance) {
      AgentMembershipRegistry.instance = new AgentMembershipRegistry();
    }
    return AgentMembershipRegistry.instance;
  }

  private registerDefaultMemberships(): void {
    const defaultAgent: AgentMembership = {
      agentId: 'A-01',
      departmentId: 'dept_eng',
      teamId: 'team_core',
      roleId: 'role_specialist',
      managerId: 'emp_02',
      allocatedBudgetUSD: 500.0,
      capabilities: ['analysis', 'planning', 'coding'],
    };
    this.register(defaultAgent);
  }

  public register(membership: AgentMembership): void {
    this.memberships.set(membership.agentId, membership);
  }

  public get(agentId: string): AgentMembership | undefined {
    return this.memberships.get(agentId);
  }

  public getByDepartment(deptId: string): AgentMembership[] {
    return Array.from(this.memberships.values()).filter((m) => m.departmentId === deptId);
  }
}
