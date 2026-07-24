import React, { useState } from 'react';

export const LogsTab: React.FC = () => {
  const [filter, setFilter] = useState('ALL');

  const sampleLogs = [
    { level: 'INFO', runtime: 'ModelGateway', msg: 'Initialized OpenRouter adapter with SSE streaming parser.' },
    { level: 'INFO', runtime: 'KnowledgeRuntime', msg: 'Document DOC-01 indexed cleanly into hybrid BM25 store.' },
    { level: 'INFO', runtime: 'WorkflowRuntime', msg: 'Registered workflow definition wf_standard_mission.' },
    { level: 'INFO', runtime: 'OrganizationRuntime', msg: 'Enterprise structure hierarchy initialized.' },
  ];

  return (
    <div className="p-6 space-y-6 text-slate-100">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-teal-400">Developer Logs</h2>
          <p className="text-sm text-slate-400">Real-time system logging with filtering capabilities</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 focus:outline-none"
        >
          <option value="ALL">All Levels</option>
          <option value="INFO">INFO Only</option>
          <option value="WARN">WARN Only</option>
          <option value="ERROR">ERROR Only</option>
        </select>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
        {sampleLogs
          .filter((l) => filter === 'ALL' || l.level === filter)
          .map((l, i) => (
            <div key={i} className="flex gap-4 py-1 border-b border-slate-900">
              <span className="text-teal-400 font-bold">[{l.level}]</span>
              <span className="text-slate-400">[{l.runtime}]</span>
              <span className="text-slate-200">{l.msg}</span>
            </div>
          ))}
      </div>
    </div>
  );
};
