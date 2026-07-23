import { ProviderAdapter } from './adapters/ProviderAdapter';
import { OpenRouterAdapter } from './adapters/OpenRouterAdapter';
import { OpenAIAdapter } from './adapters/OpenAIAdapter';
import { AnthropicAdapter } from './adapters/AnthropicAdapter';
import { GeminiAdapter } from './adapters/GeminiAdapter';
import { OllamaAdapter } from './adapters/OllamaAdapter';
import { LMStudioAdapter } from './adapters/LMStudioAdapter';
import { ModelProviderKind } from './types';

export class ProviderRegistry {
  private static instance: ProviderRegistry;
  private adapters = new Map<ModelProviderKind, ProviderAdapter>();

  private constructor() {
    this.register(new OpenRouterAdapter());
    this.register(new OpenAIAdapter());
    this.register(new AnthropicAdapter());
    this.register(new GeminiAdapter());
    this.register(new OllamaAdapter());
    this.register(new LMStudioAdapter());
  }

  public static getInstance(): ProviderRegistry {
    if (!ProviderRegistry.instance) {
      ProviderRegistry.instance = new ProviderRegistry();
    }
    return ProviderRegistry.instance;
  }

  public register(adapter: ProviderAdapter): void {
    this.adapters.set(adapter.kind, adapter);
  }

  public getAdapter(kind: ModelProviderKind): ProviderAdapter | undefined {
    return this.adapters.get(kind);
  }

  public getAll(): ProviderAdapter[] {
    return Array.from(this.adapters.values());
  }
}
