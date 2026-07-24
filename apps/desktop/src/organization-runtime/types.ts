export type RoleLevel =
  | 'CEO'
  | 'Executive'
  | 'Director'
  | 'Manager'
  | 'Lead'
  | 'Specialist'
  | 'Operator'
  | 'Custom';

export type OrgEntityType =
  | 'Organization'
  | 'BusinessUnit'
  | 'Division'
  | 'Department'
  | 'Team'
  | 'Workspace'
  | 'Project';

export interface Employee {
  id: string;
  name: string;
  position: string;
  departmentId: string;
  managerId?: string;
  reports: string[];
  skills: string[];
  availability: 'available' | 'busy' | 'offline';
  status: 'active' | 'inactive';
}

export interface AgentMembership {
  agentId: string;
  departmentId: string;
  teamId: string;
  roleId: string;
  managerId?: string;
  allocatedBudgetUSD: number;
  capabilities: string[];
}

export interface OrgRole {
  id: string;
  name: string;
  level: RoleLevel;
  parentRoleId?: string;
  permissions: string[];
}

export interface PolicyRule {
  id: string;
  name: string;
  category:
    | 'Approval'
    | 'Security'
    | 'Budget'
    | 'Compliance'
    | 'WorkingHours'
    | 'AIUsage'
    | 'KnowledgeAccess'
    | 'Retention';
  ruleExpression: string;
  action: 'allow' | 'deny' | 'require_approval';
}

export interface ResourceItem {
  id: string;
  name: string;
  type:
    | 'Project'
    | 'Workspace'
    | 'Repository'
    | 'KnowledgeBase'
    | 'Calendar'
    | 'Budget'
    | 'License'
    | 'ExternalSystem';
  ownerId: string;
  departmentId: string;
  metadata: Record<string, unknown>;
}

export interface DelegationRecord {
  id: string;
  delegatorId: string;
  delegateeId: string;
  type: 'Mission' | 'Approval' | 'Authority';
  expiresAt?: string;
  active: boolean;
}

export interface EscalationRecord {
  id: string;
  triggerType: 'Timeout' | 'Failure' | 'Priority';
  targetRoleId: string;
  escalatedAt: string;
  resolved: boolean;
}

export interface OrgEvent {
  id: string;
  type:
    | 'OrganizationCreated'
    | 'DepartmentCreated'
    | 'TeamCreated'
    | 'EmployeeAdded'
    | 'AgentAssigned'
    | 'RoleAssigned'
    | 'PermissionGranted'
    | 'PermissionRevoked'
    | 'PolicyUpdated'
    | 'DelegationCreated'
    | 'EscalationTriggered';
  timestamp: string;
  payload?: Record<string, unknown>;
}
