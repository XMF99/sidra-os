import {
  ResourceReservationToken,
  ResourceLease,
  CapacityForecast,
  ResourceMetrics,
  ResourceEvent,
  ResourcePool,
} from './types';
import { ResourceRegistry } from './ResourceRegistry';
import { CapacityManager } from './CapacityManager';
import { AllocationEngine } from './AllocationEngine';
import { LeaseManager } from './LeaseManager';
import { ResourceMetricsEngine } from './ResourceMetricsEngine';

export type ResourceEventListener = (event: ResourceEvent) => void;

export class ResourceManagementEngine {
  private static instance: ResourceManagementEngine;
  private registry = ResourceRegistry.getInstance();
  private leaseManager = new LeaseManager();
  private metricsEngine = ResourceMetricsEngine.getInstance();
  private listeners = new Set<ResourceEventListener>();
  private eventLog: ResourceEvent[] = [];

  private constructor() {}

  public static getInstance(): ResourceManagementEngine {
    if (!ResourceManagementEngine.instance) {
      ResourceManagementEngine.instance = new ResourceManagementEngine();
    }
    return ResourceManagementEngine.instance;
  }

  public subscribe(listener: ResourceEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(type: ResourceEvent['type'], poolId: string, payload?: Record<string, unknown>): void {
    const event: ResourceEvent = {
      id: `EV-RES-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      poolId,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    if (this.eventLog.length > 300) {
      this.eventLog.pop();
    }
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): ResourceEvent[] {
    return [...this.eventLog];
  }

  public allocate(
    poolId: string,
    units: number,
    requesterId: string,
    requesterType: ResourceReservationToken['requesterType'] = 'execution_coordinator',
    leaseDurationMs = 30000
  ): { token: ResourceReservationToken; lease: ResourceLease } {
    const startTime = Date.now();
    const pool = this.registry.getPool(poolId) || this.registry.getAllPools()[0];
    if (!pool) throw new Error(`Resource Pool '${poolId}' not found.`);

    const token = AllocationEngine.allocate(pool, units, requesterId, requesterType, leaseDurationMs);
    this.registry.storeToken(token);

    const lease = this.leaseManager.createLease(token);
    const latency = Date.now() - startTime;
    this.metricsEngine.recordAllocationLatency(latency);

    this.emitEvent('ResourceAllocated', pool.id, { units, requesterId, tokenId: token.id });
    this.emitEvent('LockAcquired', pool.id, { tokenId: token.id });

    return { token, lease };
  }

  public reserve(
    poolId: string,
    units: number,
    requesterId: string,
    requesterType: ResourceReservationToken['requesterType'] = 'planner'
  ): ResourceReservationToken {
    const pool = this.registry.getPool(poolId) || this.registry.getAllPools()[0];
    if (!pool) throw new Error(`Resource Pool '${poolId}' not found.`);

    const check = CapacityManager.checkCapacity(pool, units);
    if (!check.available) {
      this.emitEvent('CapacityExhausted', pool.id, { requestedUnits: units });
      throw new Error(`Resource Pool '${pool.name}' capacity exhausted.`);
    }

    pool.reservedCapacity += units;
    pool.availableCapacity -= units;

    const token: ResourceReservationToken = {
      id: `TOK-RES-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      poolId: pool.id,
      resourceType: pool.resourceType,
      requesterId,
      requesterType,
      allocatedUnits: units,
      state: 'reserved',
      leaseDurationMs: 60000,
      leaseExpiresAt: new Date(Date.now() + 60000).toISOString(),
      acquiredAt: new Date().toISOString(),
    };

    this.registry.storeToken(token);
    this.emitEvent('ResourceReserved', pool.id, { units, requesterId, tokenId: token.id });

    return token;
  }

  public release(tokenOrId: ResourceReservationToken | string): void {
    const tokenId = typeof tokenOrId === 'string' ? tokenOrId : tokenOrId.id;
    const token = this.registry.getToken(tokenId);
    if (!token) return;

    const pool = this.registry.getPool(token.poolId);
    if (pool) {
      AllocationEngine.release(pool, token.allocatedUnits);
      this.emitEvent('ResourceReleased', pool.id, { units: token.allocatedUnits, tokenId });
      this.emitEvent('LockReleased', pool.id, { tokenId });
    }

    token.state = 'released';
  }

  public renewLease(leaseId: string, extensionMs = 30000): ResourceLease {
    const lease = this.leaseManager.renewLease(leaseId, extensionMs);
    this.emitEvent('LeaseRenewed', lease.poolId, { leaseId, newExpiresAt: lease.expiresAt });
    return lease;
  }

  public forecast(): CapacityForecast[] {
    return CapacityManager.forecastCapacity(this.registry.getAllPools());
  }

  public getAllPools(): ResourcePool[] {
    return this.registry.getAllPools();
  }

  public getAllLeases(): ResourceLease[] {
    return this.leaseManager.getAllActiveLeases();
  }

  public getMetrics(): ResourceMetrics {
    return this.metricsEngine.getMetrics(this.registry.getAllPools());
  }

  public getRegistry(): ResourceRegistry {
    return this.registry;
  }
}
