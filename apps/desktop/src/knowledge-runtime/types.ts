export type DocumentFormat =
  | 'pdf'
  | 'markdown'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'json'
  | 'yaml'
  | 'code'
  | 'image'
  | 'audio'
  | 'video';

export interface DocumentRecord {
  id: string;
  title: string;
  format: DocumentFormat;
  version: string;
  author: string;
  department: string;
  workspaceId: string;
  projectId?: string;
  tags: string[];
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  tokenCount: number;
  fingerprint: string;
  language: string;
  paragraphIndex: number;
  metadata: Record<string, unknown>;
}

export interface EmbeddingRecord {
  id: string;
  chunkId: string;
  model: string;
  dimension: number;
  vector: number[];
  timestamp: string;
  status: 'active' | 'archived';
}

export type MemoryScope = 'working' | 'session' | 'long-term' | 'org';

export interface MemoryItem {
  id: string;
  scope: MemoryScope;
  key: string;
  value: unknown;
  ownerId: string;
  workspaceId: string;
  department?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface CitationRecord {
  documentId: string;
  title: string;
  version: string;
  chunkId: string;
  paragraphIndex: number;
  confidenceScore: number;
  textSnippet: string;
}

export interface RetrievalResult {
  chunks: DocumentChunk[];
  citations: CitationRecord[];
  compressedContext: string;
  totalTokens: number;
}

export interface KnowledgeEvent {
  id: string;
  type:
    | 'DocumentImported'
    | 'DocumentIndexed'
    | 'EmbeddingCreated'
    | 'KnowledgeRetrieved'
    | 'ContextBuilt'
    | 'MemoryStored'
    | 'MemoryRetrieved'
    | 'CitationGenerated';
  timestamp: string;
  payload?: Record<string, unknown>;
}
