import { DocumentRecord, DocumentChunk } from './types';

export class ChunkPipeline {
  public static process(doc: DocumentRecord, _maxChunkTokens = 200): DocumentChunk[] {
    const cleaned = doc.content.replace(/\r\n/g, '\n').trim();
    const paragraphs = cleaned.split(/\n\s*\n/);

    const chunks: DocumentChunk[] = [];
    let chunkIndex = 0;

    paragraphs.forEach((paragraph, pIdx) => {
      if (!paragraph.trim()) return;

      const words = paragraph.trim().split(/\s+/);
      const tokenEst = Math.max(1, Math.ceil(words.length * 1.3));

      // Generate FNV-1a fingerprint
      let hash = 0x811c9dc5;
      for (let i = 0; i < paragraph.length; i++) {
        hash ^= paragraph.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
      }
      const fingerprint = `fp_${(hash >>> 0).toString(16)}`;

      chunks.push({
        id: `chk_${doc.id}_${chunkIndex}`,
        documentId: doc.id,
        chunkIndex,
        text: paragraph.trim(),
        tokenCount: tokenEst,
        fingerprint,
        language: 'en',
        paragraphIndex: pIdx,
        metadata: {
          title: doc.title,
          version: doc.version,
          department: doc.department,
        },
      });

      chunkIndex++;
    });

    return chunks;
  }
}
