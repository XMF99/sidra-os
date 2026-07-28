import { ResourceLease, ResourceReservationToken } from './types';

export class LeaseManager {
  private leases = new Map<string, ResourceLease>();

  public createLease(token: ResourceReservationToken): ResourceLease {
    const leaseId = `LSE-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const lease: ResourceLease = {
      id: leaseId,
      reservationTokenId: token.id,
      poolId: token.poolId,
      allocatedUnits: token.allocatedUnits,
      durationMs: token.leaseDurationMs,
      expiresAt: token.leaseExpiresAt,
      renewedCount: 0,
      active: true,
    };
    this.leases.set(leaseId, lease);
    return lease;
  }

  public renewLease(leaseId: string, extensionMs = 30000): ResourceLease {
    const lease = this.leases.get(leaseId);
    if (!lease || !lease.active) {
      throw new Error(`Active Lease '${leaseId}' not found for renewal.`);
    }

    const currentExp = new Date(lease.expiresAt).getTime();
    const newExp = new Date(currentExp + extensionMs).toISOString();

    lease.expiresAt = newExp;
    lease.durationMs += extensionMs;
    lease.renewedCount += 1;

    return lease;
  }

  public releaseLease(leaseId: string): void {
    const lease = this.leases.get(leaseId);
    if (lease) {
      lease.active = false;
    }
  }

  public auditExpiredLeases(): ResourceLease[] {
    const now = Date.now();
    const expired: ResourceLease[] = [];

    this.leases.forEach((lease) => {
      if (lease.active && new Date(lease.expiresAt).getTime() < now) {
        lease.active = false;
        expired.push(lease);
      }
    });

    return expired;
  }

  public getAllActiveLeases(): ResourceLease[] {
    return Array.from(this.leases.values()).filter((l) => l.active);
  }
}
