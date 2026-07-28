export type ResourceType =
  | 'human_agent'
  | 'ai_agent'
  | 'model'
  | 'gpu'
  | 'cpu'
  | 'memory'
  | 'storage'
  | 'connector'
  | 'workflow_slot'
  | 'automation_worker'
  | 'mission_capacity'
  | 'execution_session'
  | 'external_api';

export type ResourceState =
  | 'available'
  | 'reserved'
  | 'allocated'
  | 'running'
  | 'paused'
  | 'blocked'
  | 'overloaded'
  | 'unavailable'
  | 'released'
  | 'retired';

export interface ResourcePool {
  id: string;
  name: string;
  resourceType: ResourceType;
  totalCapacity: number;
  allocatedCapacity: number;
  reservedCapacity: number;
  availableCapacity: number;
  unit: string;
  healthScore: number; // 0 to 100
  status: 'healthy' | 'constrained' | 'exhausted';
}

export interface ResourceReservationToken {
  id: string;
  poolId: string;
  resourceType: ResourceType;
  requesterId: string;
  requesterType: 'execution_coordinator' | 'planner' | 'decision_engine' | 'agent' | 'workflow' | 'automation';
  allocatedUnits: number;
  state: ResourceState;
  leaseDurationMs: number;
  leaseExpiresAt: string;
  acquiredAt: string;
}

export interface ResourceLease {
  id: string;
  reservationTokenId: string;
  poolId: string;
  allocatedUnits: number;
  durationMs: number;
  expiresAt: string;
  renewedCount: number;
  active: boolean;
}

export interface CapacityForecast {
  resourceType: ResourceType;
  poolName: string;
  currentUtilizationPercent: number;
  forecastedUtilizationPercent: number;
  peakUsage: number;
  queueDepth: number;
  status: 'healthy' | 'constrained' | 'exhausted';
}

export interface ResourceMetrics {
  overallUtilizationPercent: number;
  idleCapacityPercent: number;
  totalCapacityUnits: number;
  totalAllocatedUnits: number;
  peakUsageUnits: number;
  queueDepthTotal: number;
  averageAllocationDurationMs: number;
  averageLeaseDurationMs: number;
  resourceFailuresCount: number;
  poolBalanceScorePercent: number;
}

export interface ResourceEvent {
  id: string;
  type:
    | 'PoolCreated'
    | 'ResourceReserved'
    | 'ResourceAllocated'
    | 'ResourceReleased'
    | 'LeaseRenewed'
    | 'LeaseExpired'
    | 'LockAcquired'
    | 'LockReleased'
    | 'CapacityExhausted'
    | 'PoolRebalanced';
  poolId: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
