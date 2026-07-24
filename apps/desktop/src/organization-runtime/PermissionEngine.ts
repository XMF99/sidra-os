import { RoleRegistry } from './RoleRegistry';
import { AgentMembershipRegistry } from './AgentMembershipRegistry';

export class PermissionEngine {
  private static instance: PermissionEngine;
  private overrides = new Map<string, Set<string>>(); // subjectId -> permissions

  public static getInstance(): PermissionEngine {
    if (!PermissionEngine.instance) {
      PermissionEngine.instance = new PermissionEngine();
    }
    return PermissionEngine.instance;
  }

  public grantOverride(subjectId: string, permission: string): void {
    if (!this.overrides.has(subjectId)) {
      this.overrides.set(subjectId, new Set());
    }
    this.overrides.get(subjectId)!.add(permission);
  }

  public hasPermission(subjectId: string, requiredPermission: string): boolean {
    // 1. Check temporary overrides
    const subjectOverrides = this.overrides.get(subjectId);
    if (subjectOverrides && (subjectOverrides.has('*') || subjectOverrides.has(requiredPermission))) {
      return true;
    }

    // 2. Check role permissions via AgentMembership
    const membershipRegistry = AgentMembershipRegistry.getInstance();
    const roleRegistry = RoleRegistry.getInstance();

    const membership = membershipRegistry.get(subjectId);
    if (membership) {
      const role = roleRegistry.get(membership.roleId);
      if (role) {
        if (role.permissions.includes('*')) return true;
        const prefix = requiredPermission.split('.')[0];
        if (role.permissions.includes(`${prefix}.*`)) return true;
        if (role.permissions.includes(requiredPermission)) return true;
      }
    }

    return false;
  }
}
