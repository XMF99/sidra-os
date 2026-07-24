import { OrgRole, RoleLevel } from './types';

export class RoleRegistry {
  private static instance: RoleRegistry;
  private roles = new Map<string, OrgRole>();

  private constructor() {
    this.registerDefaultRoles();
  }

  public static getInstance(): RoleRegistry {
    if (!RoleRegistry.instance) {
      RoleRegistry.instance = new RoleRegistry();
    }
    return RoleRegistry.instance;
  }

  private registerDefaultRoles(): void {
    const defaultRoles: OrgRole[] = [
      { id: 'role_ceo', name: 'Chief Executive Officer', level: 'CEO', permissions: ['*'] },
      { id: 'role_director', name: 'Engineering Director', level: 'Director', permissions: ['dept.*', 'mission.*', 'budget.*'] },
      { id: 'role_manager', name: 'Team Lead Manager', level: 'Manager', permissions: ['team.*', 'mission.create', 'mission.approve'] },
      { id: 'role_specialist', name: 'AI Specialist / Agent', level: 'Specialist', permissions: ['mission.execute', 'knowledge.read'] },
      { id: 'role_operator', name: 'Operator', level: 'Operator', permissions: ['knowledge.read'] },
    ];
    defaultRoles.forEach((r) => this.register(r));
  }

  public register(role: OrgRole): void {
    this.roles.set(role.id, role);
  }

  public get(id: string): OrgRole | undefined {
    return this.roles.get(id);
  }

  public getByLevel(level: RoleLevel): OrgRole[] {
    return Array.from(this.roles.values()).filter((r) => r.level === level);
  }
}
