import React, { useState } from 'react';
import { ConnectorRuntime } from '../../connector-framework/ConnectorRuntime';

export const ConnectorManagerTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [activeConnectorId, setActiveConnectorId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const runtime = ConnectorRuntime.getInstance();
  const allConnectors = runtime.getRegistry().getAll();

  const categories = ['ALL', ...Array.from(new Set(allConnectors.map((c) => c.manifest.category)))];

  const filtered = allConnectors.filter((c) => {
    const matchesCategory = selectedCategory === 'ALL' || c.manifest.category === selectedCategory;
    const matchesSearch = c.manifest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.manifest.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleConnect = async (connectorId: string) => {
    try {
      await runtime.connectConnector(connectorId, apiKeyInput || 'sample_api_key_12345');
      setTestResult(`Successfully connected '${connectorId}'!`);
    } catch (err) {
      setTestResult(`Connection Failed: ${(err as Error).message}`);
    }
  };

  const handleTestCapability = async (connectorId: string, capability: any) => {
    try {
      const res = await runtime.executeCapability(connectorId, capability, { test: true });
      setTestResult(`Executed '${capability}' on '${connectorId}': ${JSON.stringify(res)}`);
    } catch (err) {
      setTestResult(`Execution Error: ${(err as Error).message}`);
    }
  };

  return (
    <div className="p-6 space-y-6 text-slate-100">
      <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-teal-400">Universal Connector Manager</h2>
          <p className="text-sm text-slate-400">Inspect, configure, authenticate, and test connectors across 22 enterprise categories</p>
        </div>
        <div className="text-xs text-slate-400 font-mono">Total Connectors Registered: {allConnectors.length}</div>
      </div>

      {testResult && (
        <div className={`p-3 rounded-lg border text-xs font-mono ${testResult.startsWith('Successfully') || testResult.startsWith('Executed') ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' : 'bg-rose-950/40 border-rose-500 text-rose-300'}`}>
          {testResult}
        </div>
      )}

      {/* Filter controls */}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search connectors by name or keyword..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none uppercase"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Connector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((conn) => (
          <div key={conn.manifest.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-teal-300 text-sm">{conn.manifest.name}</h3>
                <span className="text-[10px] font-mono text-slate-400 uppercase bg-slate-800 px-1.5 py-0.5 rounded">{conn.manifest.category}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${conn.state === 'connected' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-slate-800 text-slate-400'}`}>
                {conn.state}
              </span>
            </div>

            <p className="text-xs text-slate-400">{conn.manifest.description}</p>

            <div className="text-[11px] text-slate-500 flex justify-between">
              <span>Auth: {conn.manifest.authType}</span>
              <span>Latency: {conn.latencyMs}ms</span>
            </div>

            <div className="flex gap-1 flex-wrap pt-1">
              {conn.manifest.capabilities.map((cap) => (
                <button
                  key={cap}
                  onClick={() => handleTestCapability(conn.manifest.id, cap)}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-teal-900 text-slate-300 hover:text-teal-200 rounded text-[10px] transition"
                >
                  {cap}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <input
                type="password"
                placeholder="API Key / Token"
                value={activeConnectorId === conn.manifest.id ? apiKeyInput : ''}
                onChange={(e) => {
                  setActiveConnectorId(conn.manifest.id);
                  setApiKeyInput(e.target.value);
                }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-100"
              />
              <button
                onClick={() => handleConnect(conn.manifest.id)}
                className="px-3 py-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded text-xs transition"
              >
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
