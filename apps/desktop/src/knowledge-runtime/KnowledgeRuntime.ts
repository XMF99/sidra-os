import {
  DocumentRecord,
  KnowledgeEvent,
  MemoryItem,
  RetrievalResult,
  KnowledgeSource,
  SearchResultItem,
  KnowledgeMetrics,
} from './types';
import { DocumentRegistry } from './DocumentRegistry';
import { ChunkPipeline } from './ChunkPipeline';
import { KnowledgeIndex } from './KnowledgeIndex';
import { MemoryRuntime } from './MemoryRuntime';
import { RetrievalEngine } from './RetrievalEngine';
import { SearchEngine } from './SearchEngine';
import { KnowledgeGraph } from './KnowledgeGraph';
import { KnowledgeMetricsEngine } from './KnowledgeMetricsEngine';

export type KnowledgeEventListener = (event: KnowledgeEvent) => void;

export class KnowledgeRuntime {
  private static instance: KnowledgeRuntime;
  private docRegistry = DocumentRegistry.getInstance();
  private index = KnowledgeIndex.getInstance();
  private memoryRuntime = MemoryRuntime.getInstance();
  private graph = KnowledgeGraph.getInstance();
  private metricsEngine = KnowledgeMetricsEngine.getInstance();
  private sources = new Map<string, KnowledgeSource>();
  private listeners = new Set<KnowledgeEventListener>();
  private eventLog: KnowledgeEvent[] = [];

  private constructor() {
    this.registerDefaultSources();
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
    if (this.eventLog.length > 300) {
      this.eventLog.pop();
    }
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): KnowledgeEvent[] {
    return [...this.eventLog];
  }

  private registerDefaultSources(): void {
    const defaultSource: KnowledgeSource = {
      id: 'src_local_ws',
      name: 'Local Workspace Documents',
      type: 'local_file',
      uri: 'C:\\SidraWorkspaces\\documents',
      status: 'active',
      lastSyncAt: new Date().toISOString(),
    };
    this.registerSource(defaultSource);
  }

  public registerSource(source: KnowledgeSource): void {
    this.sources.set(source.id, source);
    this.emitEvent('SourceRegistered', { sourceId: source.id, name: source.name });
  }

  public getAllSources(): KnowledgeSource[] {
    return Array.from(this.sources.values());
  }

  private registerDefaultDocs(): void {
    const defaultDoc: DocumentRecord = {
      id: 'DOC-01',
      title: 'Sidra OS Security & Runtime Architecture Policy',
      format: 'markdown',
      version: '1.0.0',
      author: 'Security Officer',
      department: 'Security',
      workspaceId: 'default-ws',
      tags: ['security', 'compliance', 'architecture'],
      content: `Sidra OS enforces firm security perimeters.\n\nAll AI model access must route through the Model Gateway. All external capability calls must route strictly through the Connector Runtime. No agent may execute unapproved commands without permission broker validation.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const gamedevDoc: DocumentRecord = {
      id: 'DOC-02',
      title: 'Unreal Engine 5 Asset Pipeline Guidelines',
      format: 'markdown',
      version: '1.0.0',
      author: '3D Technical Artist',
      department: 'Game Development',
      workspaceId: 'default-ws',
      tags: ['gamedev', 'unreal', 'blender', '3d'],
      content: `3D Asset Generation Standards:\n\n1. Meshy AI mesh generation produces raw high-poly topology.\n2. Blender Python scripts perform automated retopology, decimation, and UV unwrapping.\n3. Final GLTF/FBX models are imported into UE5 content browser with material shader bindings.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.ingestDocument(defaultDoc);
    this.ingestDocument(gamedevDoc);
  }

  public ingestDocument(doc: DocumentRecord): void {
    this.docRegistry.register(doc);
    this.emitEvent('DocumentImported', { docId: doc.id, title: doc.title });

    const chunks = ChunkPipeline.process(doc);
    this.index.addChunks(chunks);
    this.emitEvent('DocumentIndexed', { docId: doc.id, chunkCount: chunks.length });
  }

  public updateDocument(docId: string, patch: Partial<DocumentRecord>): void {
    const doc = this.docRegistry.getById(docId);
    if (!doc) throw new Error(`Document '${docId}' not found.`);

    Object.assign(doc, patch);
    doc.updatedAt = new Date().toISOString();

    const chunks = ChunkPipeline.process(doc);
    this.index.addChunks(chunks);
    this.emitEvent('DocumentUpdated', { docId, title: doc.title });
  }

  public removeDocument(docId: string): boolean {
    const res = this.docRegistry.unregister(docId);
    if (res) {
      this.emitEvent('DocumentRemoved', { docId });
    }
    return res;
  }

  public retrieveContext(query: string, requesterWorkspaceId?: string): RetrievalResult {
    const startTime = Date.now();
    const result = RetrievalEngine.executeQuery(query, requesterWorkspaceId);
    const latency = Date.now() - startTime;
    this.metricsEngine.recordRetrievalLatency(latency);
    result.latencyMs = latency;

    this.emitEvent('KnowledgeRetrieved', { query, matchCount: result.chunks.length });
    this.emitEvent('CitationGenerated', { citationCount: result.citations.length });
    this.emitEvent('ContextBuilt', { totalTokens: result.totalTokens });
    return result;
  }

  public semanticSearch(query: string, limit = 5): SearchResultItem[] {
    const allChunks = this.index.getAllChunks();
    const docsMap = this.docRegistry.getAllMap();
    const res = SearchEngine.semanticSearch(query, allChunks, docsMap, limit);
    this.emitEvent('SearchExecuted', { query, searchType: 'semantic', count: res.length });
    return res;
  }

  public keywordSearch(query: string, limit = 5): SearchResultItem[] {
    const allChunks = this.index.getAllChunks();
    const docsMap = this.docRegistry.getAllMap();
    const res = SearchEngine.keywordSearch(query, allChunks, docsMap, limit);
    this.emitEvent('SearchExecuted', { query, searchType: 'keyword', count: res.length });
    return res;
  }

  public hybridSearch(query: string, limit = 5): SearchResultItem[] {
    const allChunks = this.index.getAllChunks();
    const docsMap = this.docRegistry.getAllMap();
    const res = SearchEngine.hybridSearch(query, allChunks, docsMap, limit);
    this.emitEvent('SearchExecuted', { query, searchType: 'hybrid', count: res.length });
    return res;
  }

  public reindex(): void {
    const allDocs = this.docRegistry.getAll();
    this.index.clear();
    allDocs.forEach((doc) => {
      const chunks = ChunkPipeline.process(doc);
      this.index.addChunks(chunks);
    });
    this.emitEvent('IndexRebuilt', { documentCount: allDocs.length });
  }

  public storeMemory(item: MemoryItem): void {
    this.memoryRuntime.store(item);
    this.emitEvent('MemoryStored', { key: item.key, scope: item.scope });
  }

  public getKnowledgeGraph(): KnowledgeGraph {
    return this.graph;
  }

  public getDocRegistry(): DocumentRegistry {
    return this.docRegistry;
  }

  public getMetrics(): KnowledgeMetrics {
    const docCount = this.docRegistry.getAll().length;
    const chunkCount = this.index.getAllChunks().length;
    const sourceCount = this.sources.size;
    return this.metricsEngine.getMetrics(docCount, chunkCount, sourceCount);
  }
}
