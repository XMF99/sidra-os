import { ResourcePool, CapacityForecast } from './types';

export class CapacityManager {
  public static forecastCapacity(pools: ResourcePool[]): CapacityForecast[] {
    return pools.map((pool) => {
      const utilPercent = Math.round(((pool.allocatedCapacity + pool.reservedCapacity) / Math.max(1, pool.totalCapacity)) * 100);
      const forecastedUtil = Math.min(100, Math.round(utilPercent * 1.12 + Math.random() * 3));
      const queueDepth = utilPercent > 85 ? Math.floor(Math.random() * 5 + 1) : 0;

      let status: CapacityForecast['status'] = 'healthy';
      if (utilPercent > 90) {
        status = 'exhausted';
      } else if (utilPercent > 70) {
        status = 'constrained';
      }

      return {
        resourceType: pool.resourceType,
        poolName: pool.name,
        currentUtilizationPercent: utilPercent,
        forecastedUtilizationPercent: forecastedUtil,
        peakUsage: Math.round(pool.totalCapacity * (utilPercent > 80 ? 0.95 : 0.75)),
        queueDepth,
        status,
      };
    });
  }

  public static checkCapacity(
    pool: ResourcePool,
    requestedUnits: number
  ): { available: boolean; remaining: number } {
    const remaining = pool.availableCapacity - requestedUnits;
    return {
      available: remaining >= 0,
      remaining: Math.max(0, remaining),
    };
  }
}
