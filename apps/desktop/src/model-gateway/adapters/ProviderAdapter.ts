import { ModelProviderKind, ModelInfo, CompletionRequest, CompletionResponse } from '../types';

export interface ProviderAdapter {
  kind: ModelProviderKind;
  isAvailable(): boolean;
  complete(request: CompletionRequest, model: ModelInfo): Promise<CompletionResponse>;
}
