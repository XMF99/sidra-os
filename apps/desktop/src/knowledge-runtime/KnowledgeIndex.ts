import { DocumentChunk } from './types';
import { DocumentRegistry } from './DocumentRegistry';

export class KnowledgeIndex {
  private static instance: KnowledgeIndex;
  private chunks = new Map<string, DocumentChunk>();

  public static getInstance(): KnowledgeIndex {
    if (!KnowledgeIndex.instance) {
      KnowledgeIndex.instance = new KnowledgeIndex();
    }
    return KnowledgeIndex.instance;
  }

  public addChunks(newChunks: DocumentChunk[]): void {
    newChunks.forEach((c) => this.chunks.set(c.id, c));
  }

  public search(
    query: string,
    requesterWorkspaceId?: string,
    limit = 5
  ): DocumentChunk[] {
    const docRegistry = DocumentRegistry.getInstance();
    const queryTerms = query.toLowerCase().split(/\s+/);

    const matches: Array<{ chunk: DocumentChunk; score: number }> = [];

    this.chunks.forEach((chunk) => {
      // ACL Workspace Security Verification
      if (requesterWorkspaceId) {
        const doc = docRegistry.get(chunk.documentId, requesterWorkspaceId);
        if (!doc) return;
      }

      // BM25 / Full-text term match scoring
      let score = 0;
      const textLower = chunk.text.toLowerCase();
      queryTerms.forEach((term) => {
        if (textLower.includes(term)) {
          score += 1.0;
        }
      });

      if (score > 0) {
        matches.push({ chunk, score });
      }
    });

    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, limit).map((m) => m.chunk);
  }
}
