import React, { useState, useEffect } from 'react';
import { ConnectorRuntime } from '../../connector-framework/ConnectorRuntime';
import { ConnectorCapability, ConnectorEvent } from '../../connector-framework/types';

export const ConnectorManagerTab: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState<{ [key: string]: string }>({});
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [events, setEvents] = useState<ConnectorEvent[]>([]);
  const [activeTabSubView, setActiveTabSubView] = useState<'marketplace' | 'dashboard' | 'events' | 'logs'>('marketplace');

  const runtime = ConnectorRuntime.getInstance();
  const registry = runtime.getRegistry();
  const telemetry = runtime.getTelemetry();
  const allConnectors = registry.getAll();

  useEffect(() => {
    setEvents(runtime.getEventLog());
    const unsubscribe = runtime.subscribe(() => {
      setEvents(runtime.getEventLog());
    });
    return () => unsubscribe();
  }, []);

  const categories = [
    'ALL',
    'ai',
    'gamedev',
    'design',
    'source_control',
    'project_mgmt',
    'communication',
    'email',
    'calendar',
    'documents',
    'database',
    'finance',
    'ecommerce',
    'marketing',
    'crm',
    'support',
    'hr',
    'education',
    'data_bi',
    'behavior_analytics',
    'search',
    'automation',
    'auth',
    'observability',
  ];

  const filteredConnectors = allConnectors.filter((c) => {
    const matchesCat = selectedCategory === 'ALL' || c.manifest.category === selectedCategory;
    const matchesState = selectedState === 'ALL' || c.state === selectedState;
    const matchesSearch =
      c.manifest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.manifest.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.manifest.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesState && matchesSearch;
  });

  const connectedCount = allConnectors.filter((c) => c.state === 'connected' || c.state === 'ready' || c.state === 'healthy').length;
  const installedCount = allConnectors.filter((c) => c.state !== 'not_installed' && c.state !== 'uninstalled').length;
  const errorCount = allConnectors.filter((c) => c.state === 'failed' || c.health === 'failed').length;

  const handleInstall = async (connectorId: string) => {
    try {
      await runtime.installConnector(connectorId);
      setTestResult(`Successfully installed and detected environment for '${connectorId}'`);
    } catch (err) {
      setTestResult(`Installation Error: ${(err as Error).message}`);
    }
  };

  const handleConnect = async (connectorId: string) => {
    try {
      const cred = apiKeyInput[connectorId] || 'sample_auth_token_secret_12345';
      await runtime.connectConnector(connectorId, cred);
      setTestResult(`Successfully authenticated & connected '${connectorId}' (State: READY)`);
    } catch (err) {
      setTestResult(`Authentication Error: ${(err as Error).message}`);
    }
  };

  const handleDisconnect = async (connectorId: string) => {
    try {
      await runtime.disconnectConnector(connectorId);
      setTestResult(`Disconnected connector '${connectorId}'`);
    } catch (err) {
      setTestResult(`Disconnect Error: ${(err as Error).message}`);
    }
  };

  const handleDetectApps = async (connectorId: string) => {
    await runtime.detectLocalAppAndProjects(connectorId);
    setTestResult(`App detection complete for '${connectorId}'`);
  };

  const handleExecuteCapability = async (connectorId: string, capability: ConnectorCapability) => {
    try {
      const res = await runtime.executeCapability(connectorId, capability, { timestamp: Date.now(), source: 'ConnectorManager' });
      setTestResult(`Capability Execution [${capability}] on '${connectorId}': ${JSON.stringify(res)}`);
    } catch (err) {
      setTestResult(`Execution Error: ${(err as Error).message}`);
    }
  };

  const handleRunGlobalHealthCheck = async () => {
    const results = await runtime.runHealthCheckAll();
    setTestResult(`Health Checks completed across ${Object.keys(results).length} connectors.`);
  };

  const selectedConn = allConnectors.find((c) => c.manifest.id === selectedConnectorId);

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Header Metrics Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h2 className="text-xl font-bold text-teal-400">Sidra Universal Connector Platform</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Hot-pluggable integration platform with local software detection, project discovery, and 21 lifecycle states
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Marketplace Total</div>
            <div className="text-sm font-bold text-slate-100">{allConnectors.length}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Installed</div>
            <div className="text-sm font-bold text-teal-300">{installedCount}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Connected</div>
            <div className="text-sm font-bold text-emerald-400">{connectedCount}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Errors</div>
            <div className="text-sm font-bold text-rose-400">{errorCount}</div>
          </div>
          <button
            onClick={handleRunGlobalHealthCheck}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl transition text-xs shadow-lg shadow-teal-500/20"
          >
            🔍 Run Diagnostics
          </button>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTabSubView('marketplace')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTabSubView === 'marketplace'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🛒 Marketplace ({filteredConnectors.length})
          </button>
          <button
            onClick={() => setActiveTabSubView('dashboard')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTabSubView === 'dashboard'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🎛️ Connector Manager & Dashboard
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
          <button
            onClick={() => setActiveTabSubView('logs')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTabSubView === 'logs'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📋 Telemetry Trace
          </button>
        </div>
      </div>

      {/* Console Output Banner */}
      {testResult && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex justify-between items-center ${
            testResult.includes('Success') || testResult.includes('Connected') || testResult.includes('complete')
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

      {/* Controls Bar */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search connectors by name, ID, developer, or capabilities..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none uppercase font-mono"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              Category: {cat}
            </option>
          ))}
        </select>

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none uppercase font-mono"
        >
          {['ALL', 'not_installed', 'installed', 'detected', 'configured', 'authenticated', 'connected', 'ready', 'failed', 'disabled'].map(
            (st) => (
              <option key={st} value={st}>
                State: {st}
              </option>
            )
          )}
        </select>
      </div>

      {/* Marketplace Grid Subview */}
      {activeTabSubView === 'marketplace' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredConnectors.map((conn) => {
            const isReady = conn.state === 'ready' || conn.state === 'connected';

            return (
              <div
                key={conn.manifest.id}
                className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition shadow-lg"
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{conn.manifest.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] font-mono text-teal-400 uppercase bg-teal-950/60 border border-teal-800 px-2 py-0.5 rounded-md">
                          {conn.manifest.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">v{conn.manifest.version}</span>
                        <span className="text-[10px] font-mono text-slate-500">by {conn.manifest.developer || 'Sidra OS'}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono ${
                        isReady
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                          : conn.state === 'installed' || conn.state === 'detected'
                          ? 'bg-blue-950 text-blue-300 border border-blue-500/50'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {conn.state}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">{conn.manifest.description}</p>

                  <div className="text-[10px] font-mono text-slate-500 space-y-1 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
                    <div>Size: {conn.manifest.installationSizeMb} MB</div>
                    <div>Permissions: {conn.manifest.permissionsRequired?.join(', ') || 'Standard'}</div>
                    <div>Compatibility: {conn.manifest.compatibility || 'Sidra OS Core v1.0+'}</div>
                  </div>
                </div>

                {/* Capabilities */}
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-slate-500 uppercase">Capabilities</div>
                  <div className="flex gap-1 flex-wrap">
                    {conn.manifest.capabilities.map((cap) => (
                      <span key={cap} className="px-2 py-0.5 bg-slate-800/80 text-slate-300 rounded text-[9px] font-mono border border-slate-700/60">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex gap-2">
                  {conn.state === 'not_installed' ? (
                    <button
                      onClick={() => handleInstall(conn.manifest.id)}
                      className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
                    >
                      Install Connector
                    </button>
                  ) : (
                    <div className="flex gap-2 w-full">
                      <button
                        onClick={() => handleDetectApps(conn.manifest.id)}
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition"
                      >
                        Detect Software
                      </button>
                      <button
                        onClick={() => {
                          setSelectedConnectorId(conn.manifest.id);
                          setActiveTabSubView('dashboard');
                        }}
                        className="flex-1 py-1.5 bg-teal-500/20 text-teal-300 border border-teal-500/40 hover:bg-teal-500/30 font-semibold rounded-xl text-xs transition"
                      >
                        Configure & Connect
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dashboard Subview */}
      {activeTabSubView === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connector Selector List */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 max-h-[700px] overflow-y-auto">
            <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Installed Connectors</h3>
            {allConnectors.map((conn) => (
              <div
                key={conn.manifest.id}
                onClick={() => setSelectedConnectorId(conn.manifest.id)}
                className={`p-3 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                  selectedConnectorId === conn.manifest.id
                    ? 'bg-teal-950/40 border-teal-500 text-teal-200'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/80 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold text-xs">{conn.manifest.name}</div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase">{conn.manifest.category}</div>
                </div>
                <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-400">{conn.state}</span>
              </div>
            ))}
          </div>

          {/* Selected Connector Inspection & Management Panel */}
          <div className="lg:col-span-2 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
            {selectedConn ? (
              <>
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-teal-300">{selectedConn.manifest.name}</h3>
                    <p className="text-xs text-slate-400">{selectedConn.manifest.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-teal-950 border border-teal-500/50 text-teal-300 font-mono text-xs rounded-lg font-bold uppercase">
                      State: {selectedConn.state}
                    </span>
                  </div>
                </div>

                {/* Local App & Project Discovery Card */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-slate-200">Local Software & Project Binding</h4>
                    <button
                      onClick={() => handleDetectApps(selectedConn.manifest.id)}
                      className="text-xs text-teal-400 hover:underline font-mono"
                    >
                      ↻ Rescan Environment
                    </button>
                  </div>

                  {selectedConn.detectedApp && selectedConn.detectedApp.installed ? (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-300">
                        <span>Software: {selectedConn.detectedApp.name}</span>
                        <span className="text-emerald-400 font-bold">Status: {selectedConn.detectedApp.status}</span>
                      </div>
                      <div className="text-slate-500 text-[11px]">Path: {selectedConn.detectedApp.executablePath}</div>

                      {selectedConn.detectedApp.projects && (
                        <div className="pt-2 border-t border-slate-800 space-y-1">
                          <span className="text-[10px] text-slate-400 uppercase">Bound Project Workspace:</span>
                          <select
                            value={selectedConn.selectedProject?.id || ''}
                            onChange={(e) => {
                              const proj = selectedConn.detectedApp?.projects?.find((p) => p.id === e.target.value);
                              if (proj) runtime.selectProject(selectedConn.manifest.id, proj);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200"
                          >
                            {selectedConn.detectedApp.projects.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.path}) - {p.type}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">No local desktop software detected for this connector; operating in cloud endpoint mode.</div>
                  )}
                </div>

                {/* Authentication Panel */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="font-bold text-xs text-slate-200">Authentication & Secret Credentials</h4>
                  <div className="flex gap-3">
                    <input
                      type="password"
                      placeholder={`Enter ${selectedConn.manifest.authType} token or API key...`}
                      value={apiKeyInput[selectedConn.manifest.id] || ''}
                      onChange={(e) =>
                        setApiKeyInput({
                          ...apiKeyInput,
                          [selectedConn.manifest.id]: e.target.value,
                        })
                      }
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      onClick={() => handleConnect(selectedConn.manifest.id)}
                      className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs transition"
                    >
                      Authenticate & Connect
                    </button>
                    <button
                      onClick={() => handleDisconnect(selectedConn.manifest.id)}
                      className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-semibold transition"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                {/* Capability Test Runner */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-300 uppercase font-mono">Execute Connector Capabilities</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedConn.manifest.capabilities.map((cap) => (
                      <button
                        key={cap}
                        onClick={() => handleExecuteCapability(selectedConn.manifest.id, cap)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-teal-900 text-slate-200 hover:text-teal-200 rounded-lg text-xs font-mono transition border border-slate-700/60"
                      >
                        ⚡ Execute {cap}
                      </button>
                    ))}
                  </div>
                </div>

                {/* State Transition History Timeline */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-300 uppercase font-mono">Lifecycle State History</h4>
                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto space-y-2 font-mono text-[11px]">
                    {selectedConn.history.map((rec, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-teal-400 font-bold">[{rec.state.toUpperCase()}]</span>
                          <span className="text-slate-300">{rec.reason}</span>
                        </div>
                        <span className="text-slate-500 text-[10px]">{rec.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-500 italic">Select a connector from the list to inspect lifecycle states, local application detection, authentication, and telemetry.</div>
            )}
          </div>
        </div>
      )}

      {/* Event Stream Subview */}
      {activeTabSubView === 'events' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 mb-3 text-sm">Connector Realtime Event Log</h3>
          {events.length === 0 ? (
            <p className="text-slate-500 italic">No runtime events recorded.</p>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-teal-400 font-bold">[{ev.type}]</span>
                  <span className="text-slate-200 font-semibold">{ev.connectorId}</span>
                  <span className="text-slate-400 text-[11px]">{JSON.stringify(ev.payload || {})}</span>
                </div>
                <span className="text-slate-500 text-[10px]">{ev.timestamp}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Telemetry Trace Subview */}
      {activeTabSubView === 'logs' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 mb-3 text-sm">Connector Telemetry & Audit Trace</h3>
          {telemetry.getLogs().length === 0 ? (
            <p className="text-slate-500 italic">No telemetry logs recorded.</p>
          ) : (
            telemetry.getLogs().map((l, idx) => (
              <div key={idx} className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/80 flex justify-between">
                <div className="flex space-x-3">
                  <span
                    className={`font-bold ${
                      l.level === 'error' ? 'text-rose-400' : l.level === 'warn' ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    [{l.level.toUpperCase()}]
                  </span>
                  <span className="text-slate-200 font-semibold">{l.connectorId}:</span>
                  <span className="text-slate-400">{l.message}</span>
                </div>
                <span className="text-slate-600 text-[10px]">{l.timestamp}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
