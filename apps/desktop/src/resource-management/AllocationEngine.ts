import {
  ResourcePool,
  ResourceReservationToken,
} from './types';
import { CapacityManager } from './CapacityManager';

export class AllocationEngine {
  public static allocate(
    pool: ResourcePool,
    units: number,
    requesterId: string,
    requesterType: ResourceReservationToken['requesterType'],
    leaseDurationMs = 30000
  ): ResourceReservationToken {
    const check = CapacityManager.checkCapacity(pool, units);
    if (!check.available) {
      throw new Error(`Resource Pool '${pool.name}' capacity exhausted. Required: ${units} ${pool.unit}, Available: ${pool.availableCapacity} ${pool.unit}`);
    }

    pool.allocatedCapacity += units;
    pool.availableCapacity -= units;
    if (pool.availableCapacity <= 0) {
      pool.status = 'exhausted';
    } else if (pool.availableCapacity < pool.totalCapacity * 0.3) {
      pool.status = 'constrained';
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + leaseDurationMs).toISOString();

    return {
      id: `TOK-RES-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      poolId: pool.id,
      resourceType: pool.resourceType,
      requesterId,
      requesterType,
      allocatedUnits: units,
      state: 'allocated',
      leaseDurationMs,
      leaseExpiresAt: expiresAt,
      acquiredAt: now.toISOString(),
    };
  }

  public static release(pool: ResourcePool, units: number): void {
    pool.allocatedCapacity = Math.max(0, pool.allocatedCapacity - units);
    pool.availableCapacity = Math.min(pool.totalCapacity, pool.availableCapacity + units);
    if (pool.availableCapacity > pool.totalCapacity * 0.3) {
      pool.status = 'healthy';
    }
  }
}
