import { ModelInfo, ModelProviderKind } from './types';

export class ModelRegistry {
  private static instance: ModelRegistry;
  private models = new Map<string, ModelInfo>();

  private constructor() {
    this.registerDefaultModels();
  }

  public static getInstance(): ModelRegistry {
    if (!ModelRegistry.instance) {
      ModelRegistry.instance = new ModelRegistry();
    }
    return ModelRegistry.instance;
  }

  private registerDefaultModels(): void {
    const defaults: ModelInfo[] = [
      {
        modelId: 'gpt-4o',
        provider: 'openai',
        displayName: 'OpenAI GPT-4o',
        contextWindow: 128000,
        inputCostPer1k: 0.005,
        outputCostPer1k: 0.015,
        supportsVision: true,
        supportsImages: true,
        supportsAudio: false,
        supportsTools: true,
        supportsJsonMode: true,
        supportsStreaming: true,
        priority: 10,
        status: 'active',
        metadata: {},
      },
      {
        modelId: 'claude-3-5-sonnet',
        provider: 'anthropic',
        displayName: 'Claude 3.5 Sonnet',
        contextWindow: 200000,
        inputCostPer1k: 0.003,
        outputCostPer1k: 0.015,
        supportsVision: true,
        supportsImages: true,
        supportsAudio: false,
        supportsTools: true,
        supportsJsonMode: true,
        supportsStreaming: true,
        priority: 10,
        status: 'active',
        metadata: {},
      },
      {
        modelId: 'gemini-1.5-pro',
        provider: 'gemini',
        displayName: 'Google Gemini 1.5 Pro',
        contextWindow: 1000000,
        inputCostPer1k: 0.00125,
        outputCostPer1k: 0.005,
        supportsVision: true,
        supportsImages: true,
        supportsAudio: true,
        supportsTools: true,
        supportsJsonMode: true,
        supportsStreaming: true,
        priority: 9,
        status: 'active',
        metadata: {},
      },
      {
        modelId: 'openrouter-auto',
        provider: 'openrouter',
        displayName: 'OpenRouter Auto Cascade',
        contextWindow: 128000,
        inputCostPer1k: 0.002,
        outputCostPer1k: 0.008,
        supportsVision: true,
        supportsImages: true,
        supportsAudio: false,
        supportsTools: true,
        supportsJsonMode: true,
        supportsStreaming: true,
        priority: 8,
        status: 'active',
        metadata: {},
      },
      {
        modelId: 'ollama-llama3',
        provider: 'ollama',
        displayName: 'Ollama Llama 3 (Local)',
        contextWindow: 8192,
        inputCostPer1k: 0.0,
        outputCostPer1k: 0.0,
        supportsVision: false,
        supportsImages: false,
        supportsAudio: false,
        supportsTools: true,
        supportsJsonMode: true,
        supportsStreaming: true,
        priority: 7,
        status: 'active',
        metadata: {},
      },
    ];

    defaults.forEach((m) => this.register(m));
  }

  public register(model: ModelInfo): void {
    this.models.set(model.modelId, model);
  }

  public get(modelId: string): ModelInfo | undefined {
    return this.models.get(modelId);
  }

  public getByProvider(provider: ModelProviderKind): ModelInfo[] {
    return Array.from(this.models.values()).filter((m) => m.provider === provider);
  }

  public getAll(): ModelInfo[] {
    return Array.from(this.models.values());
  }
}
