import { CompletionResponse, CompletionRequest } from './types';

export class ResponseCache {
  private static instance: ResponseCache;
  private cache = new Map<string, { response: CompletionResponse; expiresAt: number }>();

  public static getInstance(): ResponseCache {
    if (!ResponseCache.instance) {
      ResponseCache.instance = new ResponseCache();
    }
    return ResponseCache.instance;
  }

  public hashPrompt(request: CompletionRequest): string {
    const text = [
      request.categoryHint || '',
      request.temperature || 0.7,
      request.responseFormat || 'text',
      JSON.stringify(request.tools || []),
      ...request.messages.map((m) => `${m.role}:${m.content}`),
    ].join('|');

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }
    return `cache_${Math.abs(hash)}`;
  }

  public get(key: string): CompletionResponse | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return { ...entry.response, cached: true };
  }

  public set(key: string, response: CompletionResponse, ttlSeconds = 300): void {
    this.cache.set(key, {
      response,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  public invalidate(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }
}
