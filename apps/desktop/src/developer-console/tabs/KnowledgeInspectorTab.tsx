import React, { useState, useEffect } from 'react';
import { KnowledgeRuntime } from '../../knowledge-runtime/KnowledgeRuntime';
import { KnowledgeEvent, SearchResultItem, DocumentRecord } from '../../knowledge-runtime/types';

export const KnowledgeInspectorTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('security access gateway');
  const [searchType, setSearchType] = useState<'hybrid' | 'semantic' | 'keyword'>('hybrid');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [events, setEvents] = useState<KnowledgeEvent[]>([]);
  const [activeTabSubView, setActiveTabSubView] = useState<'documents' | 'search' | 'graph' | 'context' | 'events'>('documents');

  // Ingestion Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDepartment, setNewDepartment] = useState('Engineering');
  const [newContent, setNewContent] = useState('');

  const runtime = KnowledgeRuntime.getInstance();
  const docRegistry = runtime.getDocRegistry();
  const docs = docRegistry.getAll();
  const metrics = runtime.getMetrics();
  const graph = runtime.getKnowledgeGraph();
  const entities = graph.getAllEntities();
  const relationships = graph.getAllRelationships();

  useEffect(() => {
    setEvents(runtime.getEventLog());
    const unsubscribe = runtime.subscribe(() => {
      setEvents(runtime.getEventLog());
    });
    return () => unsubscribe();
  }, []);

  const handleRunSearch = () => {
    if (!searchQuery.trim()) return;
    let res: SearchResultItem[] = [];
    if (searchType === 'hybrid') {
      res = runtime.hybridSearch(searchQuery);
    } else if (searchType === 'semantic') {
      res = runtime.semanticSearch(searchQuery);
    } else {
      res = runtime.keywordSearch(searchQuery);
    }
    setSearchResults(res);
    setTestResult(`Executed ${searchType.toUpperCase()} search for '${searchQuery}': Found ${res.length} matching chunks.`);
  };

  const handleIngestDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const id = `DOC-${Math.floor(100 + Math.random() * 900)}`;
    const doc: DocumentRecord = {
      id,
      title: newTitle.trim(),
      format: 'markdown',
      version: '1.0.0',
      author: 'Knowledge Engineer',
      department: newDepartment,
      workspaceId: 'default-ws',
      tags: ['custom', 'ingested'],
      content: newContent.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    runtime.ingestDocument(doc);
    setNewTitle('');
    setNewContent('');
    setTestResult(`Successfully ingested and vector-indexed document '${doc.title}' (${doc.id})`);
  };

  const handleReindexAll = () => {
    runtime.reindex();
    setTestResult('Reindexed all workspace knowledge documents and vector chunks.');
  };

  const handleDeleteDocument = (docId: string) => {
    runtime.removeDocument(docId);
    setTestResult(`Removed document '${docId}' from Knowledge Registry.`);
  };

  const selectedDoc = docs.find((d) => d.id === selectedDocId) || (docs.length > 0 ? docs[0] : null);

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Header Metrics Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h2 className="text-xl font-bold text-teal-400">Sidra Knowledge Runtime & Vector Index</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Authoritative knowledge layer providing semantic search, hybrid retrieval, vector indexing, and graph relations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Documents</div>
            <div className="text-sm font-bold text-slate-100">{metrics.indexedDocumentsCount}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Embeddings</div>
            <div className="text-sm font-bold text-emerald-400">{metrics.embeddingCount}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Accuracy</div>
            <div className="text-sm font-bold text-teal-300">{metrics.searchAccuracyRatePercent}%</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Avg Latency</div>
            <div className="text-sm font-bold text-amber-400">{metrics.averageRetrievalLatencyMs}ms</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-view Tabs */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTabSubView('documents')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTabSubView === 'documents'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📋 Document Registry ({docs.length})
          </button>
          <button
            onClick={() => setActiveTabSubView('search')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTabSubView === 'search'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🔍 Search & Hybrid Retrieval
          </button>
          <button
            onClick={() => setActiveTabSubView('graph')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTabSubView === 'graph'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🕸️ Knowledge Graph ({entities.length} nodes)
          </button>
          <button
            onClick={() => setActiveTabSubView('context')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTabSubView === 'context'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📑 Dynamic Context Viewer
          </button>
          <button
            onClick={() => setActiveTabSubView('events')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTabSubView === 'events'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📡 Event Stream ({events.length})
          </button>
        </div>

        <button
          onClick={handleReindexAll}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-xl transition"
        >
          🔄 Reindex All Knowledge
        </button>
      </div>

      {/* Output Console Banner */}
      {testResult && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex justify-between items-center ${
            testResult.includes('ingested') || testResult.includes('Reindexed') || testResult.includes('Found')
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}
        >
          <span className="truncate">{testResult}</span>
          <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-slate-200 ml-4 font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Document Registry Subview */}
      {activeTabSubView === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Documents List */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 max-h-[750px] overflow-y-auto">
            <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Indexed Documents</h3>
            {docs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                  selectedDoc?.id === doc.id
                    ? 'bg-teal-950/40 border-teal-500 text-teal-200 shadow-teal-500/10'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/80 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-slate-100">{doc.title}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{doc.id} • v{doc.version}</span>
                  </div>
                  <span className="text-[9px] font-mono uppercase bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-teal-300">
                    {doc.format}
                  </span>
                </div>
                <div className="flex gap-1 flex-wrap pt-1">
                  {doc.tags.map((t) => (
                    <span key={t} className="text-[9px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Ingestion Form & Selected Doc Inspector */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document Ingester */}
            <form onSubmit={handleIngestDocument} className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="font-bold text-slate-200 text-sm">📥 Ingest New Knowledge Document</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Document Title (e.g. System Security Spec)"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                />
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="Department (e.g. Engineering)"
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                />
              </div>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Document Markdown or Code Content..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-teal-500"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
              >
                Ingest & Chunk Document
              </button>
            </form>

            {/* Selected Document Details */}
            {selectedDoc && (
              <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-teal-300">{selectedDoc.title}</h3>
                    <p className="text-xs text-slate-400">ID: {selectedDoc.id} | Author: {selectedDoc.author} ({selectedDoc.department})</p>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(selectedDoc.id)}
                    className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-semibold hover:bg-rose-500/40"
                  >
                    Delete Document
                  </button>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Content Preview:</span>
                  <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {selectedDoc.content}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search & Hybrid Retrieval Tester Subview */}
      {activeTabSubView === 'search' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRunSearch()}
                placeholder="Enter query to test semantic/keyword/hybrid retrieval..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              />

              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none uppercase font-mono"
              >
                <option value="hybrid">Mode: Hybrid Search (RRF)</option>
                <option value="semantic">Mode: Semantic Search</option>
                <option value="keyword">Mode: Keyword Search (BM25)</option>
              </select>

              <button
                onClick={handleRunSearch}
                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
              >
                🔍 Search
              </button>
            </div>
          </div>

          {/* Search Results Display */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">
              Search Results ({searchResults.length} matched chunks)
            </h3>
            {searchResults.length === 0 ? (
              <p className="text-slate-500 text-xs italic p-4">No search results to display. Type a query above and click Search!</p>
            ) : (
              searchResults.map((res, idx) => (
                <div key={idx} className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-teal-300">{res.document?.title || res.chunk.documentId}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-teal-950 text-teal-300 border border-teal-800 rounded font-bold">
                      Score: {res.score} ({res.searchType})
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800/80">
                    "{res.chunk.text}"
                  </p>
                  <div className="text-[10px] font-mono text-slate-500">
                    Chunk Index: {res.chunk.chunkIndex} | Tokens: {res.chunk.tokenCount} | Fingerprint: {res.chunk.fingerprint}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Knowledge Graph Subview */}
      {activeTabSubView === 'graph' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
            <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Graph Entities ({entities.length})</h3>
            {entities.map((e) => (
              <div key={e.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex justify-between items-center">
                <div>
                  <span className="text-teal-300 font-bold">{e.name}</span>
                  <span className="text-[10px] text-slate-500 block">ID: {e.id}</span>
                </div>
                <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 text-[10px] rounded uppercase font-bold">
                  {e.type}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
            <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Directed Relationships ({relationships.length})</h3>
            {relationships.map((r) => (
              <div key={r.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300 font-bold">{r.sourceEntityId}</span>
                  <span className="text-amber-400 font-bold text-[10px]">──[{r.relationshipType}]──▶</span>
                  <span className="text-slate-300 font-bold">{r.targetEntityId}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Context Viewer Subview */}
      {activeTabSubView === 'context' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Dynamic Context Assembly Inspector</h3>
          <p className="text-xs text-slate-400">
            Tests how Knowledge Runtime constructs compressed context windows with citation records for LLM model prompts.
          </p>
          <button
            onClick={() => {
              const res = runtime.retrieveContext('Sidra OS security perimeter model gateway');
              setTestResult(`Assembled Context Window: Total Tokens ${res.totalTokens}, Citations: ${res.citations.length}`);
            }}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            📑 Test Dynamic Context Window Assembly
          </button>
        </div>
      )}

      {/* Event Stream Subview */}
      {activeTabSubView === 'events' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 mb-3 text-sm">Knowledge Runtime Event Stream</h3>
          {events.length === 0 ? (
            <p className="text-slate-500 italic">No events recorded.</p>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-teal-400 font-bold">[{ev.type}]</span>
                  <span className="text-slate-400 text-[11px]">{JSON.stringify(ev.payload || {})}</span>
                </div>
                <span className="text-slate-500 text-[10px]">{ev.timestamp}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
