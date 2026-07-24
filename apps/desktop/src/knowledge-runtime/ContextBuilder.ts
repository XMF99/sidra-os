import { DocumentChunk, CitationRecord } from './types';

export class ContextBuilder {
  public static buildContext(
    chunks: DocumentChunk[],
    citations: CitationRecord[],
    maxTokens = 4000
  ): { compressedContext: string; totalTokens: number } {
    let contextText = '';
    let totalTokens = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const citation = citations[i];

      const snippet = `[Source: ${citation.title} v${citation.version} (Para ${citation.paragraphIndex})]\n${chunk.text}\n\n`;

      if (totalTokens + chunk.tokenCount > maxTokens) {
        break;
      }

      contextText += snippet;
      totalTokens += chunk.tokenCount;
    }

    return {
      compressedContext: contextText.trim(),
      totalTokens,
    };
  }
}
