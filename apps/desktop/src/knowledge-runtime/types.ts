export type DocumentFormat =
  | 'pdf'
  | 'docx'
  | 'markdown'
  | 'txt'
  | 'json'
  | 'csv'
  | 'html'
  | 'code'
  | 'log'
  | 'word'
  | 'excel'
  | 'powerpoint';

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

export interface KnowledgeSource {
  id: string;
  name: string;
  type: 'local_file' | 'git_repo' | 'connector' | 'runtime_log' | 'mission_output';
  uri: string;
  status: 'active' | 'syncing' | 'error';
  lastSyncAt: string;
}

export interface KnowledgeCollection {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  documentCount: number;
}

export interface DocumentRecord {
  id: string;
  title: string;
  format: DocumentFormat;
  version: string;
  author: string;
  department: string;
  workspaceId: string;
  projectId?: string;
  sourceId?: string;
  collectionId?: string;
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

export interface KnowledgeGraphEntity {
  id: string;
  type: 'Project' | 'Person' | 'Organization' | 'Document' | 'Mission' | 'Task' | 'Agent';
  name: string;
  metadata?: Record<string, unknown>;
}

export interface KnowledgeGraphRelationship {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationshipType: 'DEPENDS_ON' | 'CREATED_BY' | 'REFERENCES' | 'EXECUTES' | 'BELONGS_TO' | 'PART_OF';
  weight?: number;
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

export interface SearchResultItem {
  chunk: DocumentChunk;
  document?: DocumentRecord;
  score: number;
  searchType: 'semantic' | 'keyword' | 'hybrid';
}

export interface RetrievalResult {
  chunks: DocumentChunk[];
  citations: CitationRecord[];
  compressedContext: string;
  totalTokens: number;
  searchType?: 'semantic' | 'keyword' | 'hybrid';
  latencyMs?: number;
}

export interface KnowledgeMetrics {
  indexedDocumentsCount: number;
  embeddingCount: number;
  knowledgeSourcesCount: number;
  averageRetrievalLatencyMs: number;
  searchAccuracyRatePercent: number;
  totalTokensIndexed: number;
  knowledgeGrowthRatePercent: number;
  importFailuresCount: number;
}

export interface KnowledgeEvent {
  id: string;
  type:
    | 'SourceRegistered'
    | 'DocumentImported'
    | 'DocumentUpdated'
    | 'DocumentRemoved'
    | 'DocumentIndexed'
    | 'EmbeddingCreated'
    | 'KnowledgeRetrieved'
    | 'SearchExecuted'
    | 'ContextBuilt'
    | 'GraphEntityAdded'
    | 'GraphRelationshipAdded'
    | 'IndexRebuilt'
    | 'CitationGenerated'
    | 'MemoryStored'
    | 'MemoryRetrieved';
  timestamp: string;
  payload?: Record<string, unknown>;
}
