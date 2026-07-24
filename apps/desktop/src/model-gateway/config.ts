export interface OpenRouterConfig {
  apiKey?: string;
  baseUrl: string;
  defaultModel: string;
}

export class ModelGatewayConfig {
  public static getOpenRouterConfig(): OpenRouterConfig {
    const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
    const procEnv = (typeof process !== 'undefined' && process.env) ? process.env : {};

    const apiKey = metaEnv.VITE_OPENROUTER_API_KEY || procEnv.OPENROUTER_API_KEY || undefined;
    const baseUrl = metaEnv.VITE_OPENROUTER_BASE_URL || procEnv.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    const defaultModel = metaEnv.VITE_OPENROUTER_DEFAULT_MODEL || procEnv.OPENROUTER_DEFAULT_MODEL || 'anthropic/claude-3.5-sonnet';

    return {
      apiKey,
      baseUrl,
      defaultModel,
    };
  }
}
