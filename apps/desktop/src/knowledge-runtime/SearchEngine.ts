import { DocumentChunk, SearchResultItem, DocumentRecord } from './types';

export class SearchEngine {
  public static semanticSearch(
    query: string,
    chunks: DocumentChunk[],
    docsMap: Map<string, DocumentRecord>,
    limit = 5
  ): SearchResultItem[] {
    const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);

    const scored = chunks.map((chunk) => {
      const textLower = chunk.text.toLowerCase();
      let matches = 0;
      queryTokens.forEach((t) => {
        if (textLower.includes(t)) matches += 1;
      });

      const score = Math.min(0.99, Math.max(0.1, (matches / Math.max(1, queryTokens.length)) * 0.95 + Math.random() * 0.05));
      return {
        chunk,
        document: docsMap.get(chunk.documentId),
        score: Math.round(score * 100) / 100,
        searchType: 'semantic' as const,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }

  public static keywordSearch(
    query: string,
    chunks: DocumentChunk[],
    docsMap: Map<string, DocumentRecord>,
    limit = 5
  ): SearchResultItem[] {
    const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);

    const scored = chunks.map((chunk) => {
      const textLower = chunk.text.toLowerCase();
      let termFreq = 0;
      queryTokens.forEach((t) => {
        const regex = new RegExp(`\\b${t}\\b`, 'gi');
        const m = textLower.match(regex);
        if (m) termFreq += m.length;
      });

      const score = Math.min(0.99, (termFreq * 0.2) / Math.max(1, queryTokens.length));
      return {
        chunk,
        document: docsMap.get(chunk.documentId),
        score: Math.round(score * 100) / 100,
        searchType: 'keyword' as const,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
  }

  public static hybridSearch(
    query: string,
    chunks: DocumentChunk[],
    docsMap: Map<string, DocumentRecord>,
    limit = 5
  ): SearchResultItem[] {
    const sem = this.semanticSearch(query, chunks, docsMap, limit * 2);
    const kw = this.keywordSearch(query, chunks, docsMap, limit * 2);

    const scoreMap = new Map<string, SearchResultItem>();

    sem.forEach((item, r) => {
      const rankScore = 1 / (60 + r + 1);
      scoreMap.set(item.chunk.id, { ...item, score: rankScore, searchType: 'hybrid' });
    });

    kw.forEach((item, r) => {
      const rankScore = 1 / (60 + r + 1);
      const existing = scoreMap.get(item.chunk.id);
      if (existing) {
        existing.score += rankScore;
      } else {
        scoreMap.set(item.chunk.id, { ...item, score: rankScore, searchType: 'hybrid' });
      }
    });

    const combined = Array.from(scoreMap.values());
    combined.sort((a, b) => b.score - a.score);
    return combined.slice(0, limit);
  }
}
