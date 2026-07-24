import { OrgEntityType } from './types';

export interface OrgEntityNode {
  id: string;
  name: string;
  type: OrgEntityType;
  parentId?: string;
  metadata?: Record<string, unknown>;
}

export class OrganizationRegistry {
  private static instance: OrganizationRegistry;
  private nodes = new Map<string, OrgEntityNode>();

  private constructor() {
    this.registerDefaultHierarchy();
  }

  public static getInstance(): OrganizationRegistry {
    if (!OrganizationRegistry.instance) {
      OrganizationRegistry.instance = new OrganizationRegistry();
    }
    return OrganizationRegistry.instance;
  }

  private registerDefaultHierarchy(): void {
    const org: OrgEntityNode = { id: 'org_enterprise', name: 'Sidra Enterprise Global', type: 'Organization' };
    const bu: OrgEntityNode = { id: 'bu_tech', name: 'Technology Business Unit', type: 'BusinessUnit', parentId: 'org_enterprise' };
    const dept: OrgEntityNode = { id: 'dept_eng', name: 'Engineering Department', type: 'Department', parentId: 'bu_tech' };
    const team: OrgEntityNode = { id: 'team_core', name: 'Core AI Platform Team', type: 'Team', parentId: 'dept_eng' };

    [org, bu, dept, team].forEach((n) => this.nodes.set(n.id, n));
  }

  public register(node: OrgEntityNode): void {
    this.nodes.set(node.id, node);
  }

  public get(id: string): OrgEntityNode | undefined {
    return this.nodes.get(id);
  }

  public getChildren(parentId: string): OrgEntityNode[] {
    return Array.from(this.nodes.values()).filter((n) => n.parentId === parentId);
  }

  public getAll(): OrgEntityNode[] {
    return Array.from(this.nodes.values());
  }
}
