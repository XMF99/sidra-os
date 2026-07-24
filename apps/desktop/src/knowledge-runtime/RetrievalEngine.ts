import { RetrievalResult } from './types';
import { KnowledgeIndex } from './KnowledgeIndex';
import { CitationEngine } from './CitationEngine';
import { ContextBuilder } from './ContextBuilder';

export class RetrievalEngine {
  public static executeQuery(
    query: string,
    requesterWorkspaceId?: string,
    maxTokens = 4000
  ): RetrievalResult {
    const index = KnowledgeIndex.getInstance();
    const chunks = index.search(query, requesterWorkspaceId, 5);

    const citations = chunks.map((c) => CitationEngine.generateCitation(c));
    const { compressedContext, totalTokens } = ContextBuilder.buildContext(
      chunks,
      citations,
      maxTokens
    );

    return {
      chunks,
      citations,
      compressedContext,
      totalTokens,
    };
  }
}
