export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
  jitter?: boolean;
}

export class RetryEngine {
  public static async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const maxRetries = options.maxRetries ?? 3;
    const initialDelayMs = options.initialDelayMs ?? 200;
    const backoffFactor = options.backoffFactor ?? 2;
    const useJitter = options.jitter ?? true;

    let lastError: unknown;
    let delay = initialDelayMs;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (attempt === maxRetries) break;

        const actualDelay = useJitter
          ? delay * (0.8 + Math.random() * 0.4)
          : delay;

        await new Promise((res) => setTimeout(res, actualDelay));
        delay *= backoffFactor;
      }
    }

    throw lastError;
  }
}
