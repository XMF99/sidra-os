import {
  DocumentRecord,
  KnowledgeEvent,
  MemoryItem,
  RetrievalResult,
} from './types';
import { DocumentRegistry } from './DocumentRegistry';
import { ChunkPipeline } from './ChunkPipeline';
import { KnowledgeIndex } from './KnowledgeIndex';
import { MemoryRuntime } from './MemoryRuntime';
import { RetrievalEngine } from './RetrievalEngine';

export type KnowledgeEventListener = (event: KnowledgeEvent) => void;

export class KnowledgeRuntime {
  private static instance: KnowledgeRuntime;
  private docRegistry = DocumentRegistry.getInstance();
  private index = KnowledgeIndex.getInstance();
  private memoryRuntime = MemoryRuntime.getInstance();
  private listeners = new Set<KnowledgeEventListener>();
  private eventLog: KnowledgeEvent[] = [];

  private constructor() {
    this.registerDefaultDocs();
  }

  public static getInstance(): KnowledgeRuntime {
    if (!KnowledgeRuntime.instance) {
      KnowledgeRuntime.instance = new KnowledgeRuntime();
    }
    return KnowledgeRuntime.instance;
  }

  public subscribe(listener: KnowledgeEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(type: KnowledgeEvent['type'], payload?: Record<string, unknown>): void {
    const event: KnowledgeEvent = {
      id: `EV-KN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): KnowledgeEvent[] {
    return [...this.eventLog];
  }

  private registerDefaultDocs(): void {
    const defaultDoc: DocumentRecord = {
      id: 'DOC-01',
      title: 'Sidra OS Security Policy',
      format: 'markdown',
      version: '1.0.0',
      author: 'Security Officer',
      department: 'Security',
      workspaceId: 'default-ws',
      tags: ['security', 'compliance'],
      content: `Sidra OS enforces firm security perimeters.\n\nAll AI model access must route through the Model Gateway. No agent may execute unapproved commands without permission broker validation.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.importDocument(defaultDoc);
  }

  public importDocument(doc: DocumentRecord): void {
    this.docRegistry.register(doc);
    this.emitEvent('DocumentImported', { docId: doc.id, title: doc.title });

    const chunks = ChunkPipeline.process(doc);
    this.index.addChunks(chunks);
    this.emitEvent('DocumentIndexed', { docId: doc.id, chunkCount: chunks.length });
  }

  public retrieveContext(query: string, requesterWorkspaceId?: string): RetrievalResult {
    const result = RetrievalEngine.executeQuery(query, requesterWorkspaceId);
    this.emitEvent('KnowledgeRetrieved', { query, matchCount: result.chunks.length });
    this.emitEvent('CitationGenerated', { citationCount: result.citations.length });
    this.emitEvent('ContextBuilt', { totalTokens: result.totalTokens });
    return result;
  }

  public storeMemory(item: MemoryItem): void {
    this.memoryRuntime.store(item);
    this.emitEvent('MemoryStored', { key: item.key, scope: item.scope });
  }

  public getDocRegistry(): DocumentRegistry {
    return this.docRegistry;
  }
}
