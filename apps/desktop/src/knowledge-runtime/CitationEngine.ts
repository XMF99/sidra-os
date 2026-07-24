import { DocumentChunk, CitationRecord } from './types';
import { DocumentRegistry } from './DocumentRegistry';

export class CitationEngine {
  public static generateCitation(chunk: DocumentChunk, confidenceScore = 0.95): CitationRecord {
    const docRegistry = DocumentRegistry.getInstance();
    const doc = docRegistry.get(chunk.documentId);

    return {
      documentId: chunk.documentId,
      title: doc ? doc.title : 'Unknown Document',
      version: doc ? doc.version : '1.0.0',
      chunkId: chunk.id,
      paragraphIndex: chunk.paragraphIndex,
      confidenceScore,
      textSnippet: chunk.text.length > 100 ? `${chunk.text.substring(0, 100)}...` : chunk.text,
    };
  }
}
