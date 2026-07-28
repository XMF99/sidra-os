import { ResourcePool, ResourceReservationToken } from './types';

export class ResourceRegistry {
  private static instance: ResourceRegistry;
  private pools = new Map<string, ResourcePool>();
  private tokens = new Map<string, ResourceReservationToken>();

  private constructor() {
    this.seedDefaultPools();
  }

  public static getInstance(): ResourceRegistry {
    if (!ResourceRegistry.instance) {
      ResourceRegistry.instance = new ResourceRegistry();
    }
    return ResourceRegistry.instance;
  }

  private seedDefaultPools(): void {
    const defaultPools: ResourcePool[] = [
      { id: 'pool_cpu', name: 'CPU Core Processing Pool', resourceType: 'cpu', totalCapacity: 32, allocatedCapacity: 8, reservedCapacity: 4, availableCapacity: 20, unit: 'Cores', healthScore: 98, status: 'healthy' },
      { id: 'pool_gpu', name: 'NVIDIA GPU Acceleration Pool', resourceType: 'gpu', totalCapacity: 8, allocatedCapacity: 2, reservedCapacity: 1, availableCapacity: 5, unit: 'GPUs', healthScore: 95, status: 'healthy' },
      { id: 'pool_ram', name: 'System Memory Pool', resourceType: 'memory', totalCapacity: 128, allocatedCapacity: 42, reservedCapacity: 10, availableCapacity: 76, unit: 'GB', healthScore: 96, status: 'healthy' },
      { id: 'pool_ai_agents', name: 'Autonomous AI Worker Pool', resourceType: 'ai_agent', totalCapacity: 16, allocatedCapacity: 4, reservedCapacity: 2, availableCapacity: 10, unit: 'Workers', healthScore: 94, status: 'healthy' },
      { id: 'pool_models', name: 'Model Gateway Slots Pool', resourceType: 'model', totalCapacity: 20, allocatedCapacity: 6, reservedCapacity: 2, availableCapacity: 12, unit: 'Slots', healthScore: 97, status: 'healthy' },
      { id: 'pool_connectors', name: 'External Connector Slots Pool', resourceType: 'connector', totalCapacity: 50, allocatedCapacity: 12, reservedCapacity: 5, availableCapacity: 33, unit: 'Conns', healthScore: 99, status: 'healthy' },
      { id: 'pool_workflows', name: 'Workflow Execution Slots', resourceType: 'workflow_slot', totalCapacity: 40, allocatedCapacity: 8, reservedCapacity: 4, availableCapacity: 28, unit: 'Slots', healthScore: 96, status: 'healthy' },
      { id: 'pool_automations', name: 'Automation Workers Pool', resourceType: 'automation_worker', totalCapacity: 25, allocatedCapacity: 5, reservedCapacity: 2, availableCapacity: 18, unit: 'Workers', healthScore: 95, status: 'healthy' },
    ];

    defaultPools.forEach((p) => this.pools.set(p.id, p));
  }

  public getPool(id: string): ResourcePool | undefined {
    return this.pools.get(id);
  }

  public getPoolByType(type: string): ResourcePool | undefined {
    return Array.from(this.pools.values()).find((p) => p.resourceType === type);
  }

  public getAllPools(): ResourcePool[] {
    return Array.from(this.pools.values());
  }

  public storeToken(token: ResourceReservationToken): void {
    this.tokens.set(token.id, token);
  }

  public getToken(id: string): ResourceReservationToken | undefined {
    return this.tokens.get(id);
  }

  public getAllTokens(): ResourceReservationToken[] {
    return Array.from(this.tokens.values());
  }
}
