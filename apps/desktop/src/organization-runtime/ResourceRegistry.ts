import { ResourceItem } from './types';

export class ResourceRegistry {
  private static instance: ResourceRegistry;
  private resources = new Map<string, ResourceItem>();

  public static getInstance(): ResourceRegistry {
    if (!ResourceRegistry.instance) {
      ResourceRegistry.instance = new ResourceRegistry();
    }
    return ResourceRegistry.instance;
  }

  public register(item: ResourceItem): void {
    this.resources.set(item.id, item);
  }

  public get(id: string): ResourceItem | undefined {
    return this.resources.get(id);
  }

  public getByDepartment(deptId: string): ResourceItem[] {
    return Array.from(this.resources.values()).filter((r) => r.departmentId === deptId);
  }
}
