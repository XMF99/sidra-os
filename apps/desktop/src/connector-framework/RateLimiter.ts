export class RateLimiter {
  private static instance: RateLimiter;
  private limits = new Map<string, { tokens: number; maxTokens: number; lastRefill: number; refillRatePerSec: number }>();

  public static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  public configureLimit(connectorId: string, maxTokens = 60, refillRatePerSec = 10): void {
    this.limits.set(connectorId, {
      tokens: maxTokens,
      maxTokens,
      lastRefill: Date.now(),
      refillRatePerSec,
    });
  }

  public tryConsume(connectorId: string, tokensRequested = 1): boolean {
    let bucket = this.limits.get(connectorId);
    if (!bucket) {
      this.configureLimit(connectorId);
      bucket = this.limits.get(connectorId)!;
    }

    const now = Date.now();
    const elapsedSec = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + elapsedSec * bucket.refillRatePerSec);
    bucket.lastRefill = now;

    if (bucket.tokens >= tokensRequested) {
      bucket.tokens -= tokensRequested;
      return true;
    }

    return false;
  }

  public getAvailableTokens(connectorId: string): number {
    const bucket = this.limits.get(connectorId);
    return bucket ? Math.floor(bucket.tokens) : 60;
  }
}
