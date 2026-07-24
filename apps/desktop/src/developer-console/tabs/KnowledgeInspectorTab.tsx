import React, { useState } from 'react';
import { KnowledgeRuntime } from '../../knowledge-runtime/KnowledgeRuntime';
import { RetrievalResult } from '../../knowledge-runtime/types';

export const KnowledgeInspectorTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('security policies');
  const [result, setResult] = useState<RetrievalResult | null>(null);

  const knowledgeRuntime = KnowledgeRuntime.getInstance();
  const docs = knowledgeRuntime.getDocRegistry().getAll();

  const handleSearch = () => {
    const res = knowledgeRuntime.retrieveContext(searchQuery);
    setResult(res);
  };

  return (
    <div className="p-6 space-y-6 text-slate-100">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-teal-400">Knowledge Inspector</h2>
        <p className="text-sm text-slate-400">Inspect registered documents, chunking output, hybrid search, citations, and memory layers</p>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Hybrid Search Query..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg text-sm transition"
        >
          Execute Hybrid Retrieval
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <h3 className="font-semibold text-slate-200 text-sm">Indexed Document Registry ({docs.length})</h3>
          {docs.map((d) => (
            <div key={d.id} className="p-3 bg-slate-950 rounded border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-teal-300">{d.title} (v{d.version})</div>
              <div className="text-slate-400">Dept: {d.department} | Format: {d.format}</div>
              <div className="text-[11px] text-slate-500 italic truncate">{d.content}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">Retrieval Results & Generated Citations</h3>
          {result ? (
            <div className="space-y-3 text-xs">
              <div className="text-teal-400">Matched Chunks: {result.chunks.length} | Tokens: {result.totalTokens}</div>
              {result.citations.map((c, i) => (
                <div key={i} className="p-2 bg-slate-900 rounded border border-slate-800 space-y-1">
                  <div className="font-semibold text-emerald-300">[Citation] {c.title} (Para {c.paragraphIndex}) - Conf: {c.confidenceScore}</div>
                  <div className="text-slate-300">{c.textSnippet}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic">Execute a search query to view real-time citation assembly.</div>
          )}
        </div>
      </div>
    </div>
  );
};
