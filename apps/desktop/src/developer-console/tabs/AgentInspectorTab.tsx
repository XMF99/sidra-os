import React, { useState, useEffect } from 'react';
import { AgentRuntime } from '../../agent-runtime/AgentRuntime';
import { AgentRuntimeEvent } from '../../agent-runtime/types';

export const AgentInspectorTab: React.FC = () => {
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [events, setEvents] = useState<AgentRuntimeEvent[]>([]);
  const [activeTabSubView, setActiveTabSubView] = useState<'agents' | 'templates' | 'events'>('agents');
  const [nameOverride, setNameOverride] = useState('');

  const runtime = AgentRuntime.getInstance();
  const registry = runtime.getRegistry();
  const templates = registry.getAllTemplates();
  const agents = registry.getAll();
  const metrics = runtime.getMetrics();

  useEffect(() => {
    setEvents(runtime.getEventLog());
    const unsubscribe = runtime.subscribe(() => {
      setEvents(runtime.getEventLog());
    });
    return () => unsubscribe();
  }, []);

  const handleInstantiateTemplate = (templateId: string) => {
    try {
      const agent = runtime.instantiateTemplate(templateId, nameOverride.trim() || undefined);
      setSelectedAgentId(agent.id);
      setActiveTabSubView('agents');
      setNameOverride('');
      setTestResult(`Instantiated agent '${agent.name}' (${agent.id})`);
    } catch (err) {
      setTestResult(`Instantiate Error: ${(err as Error).message}`);
    }
  };

  const handleStartAgent = (agentId: string) => {
    runtime.startAgent(agentId);
    setTestResult(`Started agent '${agentId}'`);
  };

  const handlePauseAgent = (agentId: string) => {
    runtime.pauseAgent(agentId);
    setTestResult(`Paused agent '${agentId}'`);
  };

  const handleResumeAgent = (agentId: string) => {
    runtime.resumeAgent(agentId);
    setTestResult(`Resumed agent '${agentId}'`);
  };

  const handleRestartAgent = (agentId: string) => {
    runtime.restartAgent(agentId);
    setTestResult(`Restarted agent '${agentId}'`);
  };

  const handleTerminateAgent = (agentId: string) => {
    runtime.terminateAgent(agentId);
    setTestResult(`Terminated agent '${agentId}'`);
  };

  const handleCapabilityRequest = async (agentId: string, connectorId: string, capability: string) => {
    try {
      const res = await runtime.requestCapability(agentId, connectorId, capability, { test: true });
      setTestResult(`Agent '${agentId}' executed capability '${capability}' via Connector '${connectorId}': ${JSON.stringify(res)}`);
    } catch (err) {
      setTestResult(`Capability Error: ${(err as Error).message}`);
    }
  };

  const handleEscalate = (agentId: string) => {
    runtime.escalateTask(agentId, 'High complexity task requiring principal intervention');
    setTestResult(`Escalated task for agent '${agentId}'`);
  };

  const filteredAgents = agents.filter((a) => {
    const matchesState = selectedStateFilter === 'ALL' || a.state === selectedStateFilter;
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesSearch;
  });

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || (agents.length > 0 ? agents[0] : null);

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Header Metrics Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🤖</span>
            <div>
              <h2 className="text-xl font-bold text-teal-400">Sidra Agent Runtime & Supervisor</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous AI worker orchestrator executing missions, workflows, automations, and connector capabilities
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Total Agents</div>
            <div className="text-sm font-bold text-slate-100">{metrics.totalAgents}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Active</div>
            <div className="text-sm font-bold text-emerald-400">{metrics.activeAgents}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Healthy</div>
            <div className="text-sm font-bold text-teal-300">{metrics.healthyAgentsCount}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Throughput</div>
            <div className="text-sm font-bold text-blue-400">{metrics.taskThroughputPerMin}/m</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Avg Latency</div>
            <div className="text-sm font-bold text-amber-400">{metrics.averageResponseDurationMs}ms</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-view Tabs */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTabSubView('agents')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTabSubView === 'agents'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📋 Installed Agents ({filteredAgents.length})
          </button>
          <button
            onClick={() => setActiveTabSubView('templates')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTabSubView === 'templates'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📚 Agent Templates ({templates.length})
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
      </div>

      {/* Console Banner Output */}
      {testResult && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex justify-between items-center ${
            testResult.includes('Instantiated') || testResult.includes('Started') || testResult.includes('executed')
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

      {/* Templates Subview */}
      {activeTabSubView === 'templates' && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={nameOverride}
              onChange={(e) => setNameOverride(e.target.value)}
              placeholder="Optional custom agent name override..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((tmpl) => (
              <div key={tmpl.id} className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between shadow-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-100 text-sm">{tmpl.name}</h3>
                    <span className="text-[10px] font-mono text-teal-400 uppercase bg-teal-950 border border-teal-800 px-2 py-0.5 rounded-md">
                      {tmpl.department}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{tmpl.profile.bio}</p>

                  <div className="flex gap-1 flex-wrap pt-2">
                    {tmpl.defaultCapabilities.map((cap) => (
                      <span key={cap} className="text-[9px] font-mono text-teal-300 bg-teal-950/80 border border-teal-800 px-1.5 py-0.5 rounded">
                        ⚡ {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleInstantiateTemplate(tmpl.id)}
                  className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
                >
                  🤖 Instantiate Agent
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agents Subview */}
      {activeTabSubView === 'agents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Agents List */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 max-h-[750px] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 text-sm">Agents List</h3>
              <div className="flex gap-2 items-center">
                <select
                  value={selectedStateFilter}
                  onChange={(e) => setSelectedStateFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-300 uppercase font-mono"
                >
                  {['ALL', 'ready', 'assigned', 'running', 'waiting', 'paused', 'blocked', 'failed', 'offline'].map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none w-24"
                />
              </div>
            </div>

            {filteredAgents.map((a) => (
              <div
                key={a.id}
                onClick={() => setSelectedAgentId(a.id)}
                className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                  selectedAgent?.id === a.id
                    ? 'bg-teal-950/40 border-teal-500 text-teal-200 shadow-teal-500/10'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/80 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-slate-100">{a.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{a.role} • {a.department}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      a.state === 'running' || a.state === 'assigned'
                        ? 'bg-teal-950 text-teal-300 border border-teal-500/50 animate-pulse'
                        : a.state === 'ready'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : a.state === 'paused'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {a.state}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                  <span>Health: <span className="text-teal-400">{a.health}</span></span>
                  <span>Tasks: {a.completedTasksCount || 0}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Agent Inspector Dashboard */}
          <div className="lg:col-span-2 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
            {selectedAgent ? (
              <>
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold text-teal-300">{selectedAgent.name}</h3>
                      <span className="text-xs font-mono uppercase bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md text-slate-300">
                        {selectedAgent.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{selectedAgent.profile?.bio || selectedAgent.role}</p>
                  </div>

                  <div className="flex gap-2">
                    {selectedAgent.state === 'ready' || selectedAgent.state === 'created' || selectedAgent.state === 'initialized' ? (
                      <button
                        onClick={() => handleStartAgent(selectedAgent.id)}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
                      >
                        ▶ Start Agent
                      </button>
                    ) : selectedAgent.state === 'running' ? (
                      <button
                        onClick={() => handlePauseAgent(selectedAgent.id)}
                        className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold"
                      >
                        Pause
                      </button>
                    ) : selectedAgent.state === 'paused' ? (
                      <button
                        onClick={() => handleResumeAgent(selectedAgent.id)}
                        className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold"
                      >
                        Resume
                      </button>
                    ) : null}

                    <button
                      onClick={() => handleRestartAgent(selectedAgent.id)}
                      className="px-3 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-xl text-xs font-semibold"
                    >
                      Restart
                    </button>
                    <button
                      onClick={() => handleTerminateAgent(selectedAgent.id)}
                      className="px-3 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold"
                    >
                      Terminate
                    </button>
                  </div>
                </div>

                {/* Capabilities & Skills Catalog */}
                <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 font-mono text-xs">
                  <div className="space-y-1.5">
                    <span className="text-slate-500 uppercase text-[10px] font-bold">Capabilities Catalog</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {selectedAgent.capabilities.map((cap) => (
                        <span key={cap} className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded">
                          ⚡ {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-slate-500 uppercase text-[10px] font-bold">Specialized Skills</span>
                    <div className="space-y-1">
                      {selectedAgent.skills && selectedAgent.skills.length > 0 ? (
                        selectedAgent.skills.map((s) => (
                          <div key={s.id} className="text-[10px] text-slate-300 flex justify-between">
                            <span>{s.name}</span>
                            <span className="text-teal-400 font-bold">{s.proficiency}%</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-600 text-[10px] italic">General purpose skill set</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Requested Capabilities via Connector Runtime */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-300 uppercase font-mono">Execute Capability via Connector Runtime</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCapabilityRequest(selectedAgent.id, 'conn_openrouter', 'execute')}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-teal-300 text-xs font-mono rounded-lg"
                    >
                      🔌 Test OpenRouter LLM Execution
                    </button>
                    <button
                      onClick={() => handleCapabilityRequest(selectedAgent.id, 'conn_github', 'read')}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-blue-300 text-xs font-mono rounded-lg"
                    >
                      🔌 Test GitHub Repo Inspection
                    </button>
                    <button
                      onClick={() => handleEscalate(selectedAgent.id)}
                      className="px-3 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 text-xs font-mono rounded-lg"
                    >
                      ⚠️ Escalate Task
                    </button>
                  </div>
                </div>

                {/* Memory References */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-300 uppercase font-mono">Memory References & Vector Context</h4>
                  <div className="space-y-2">
                    {selectedAgent.memoryReferences.map((mem) => (
                      <div key={mem.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 text-xs font-mono">
                        <div className="flex justify-between text-teal-300 font-bold">
                          <span>[{mem.type.toUpperCase()}] {mem.summary}</span>
                          <span className="text-slate-500 text-[10px]">{mem.referenceUri}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-500 italic">Select an installed agent to inspect capabilities, skills, memory references, and task controls.</div>
            )}
          </div>
        </div>
      )}

      {/* Event Stream Subview */}
      {activeTabSubView === 'events' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 mb-3 text-sm">Agent Runtime Event Stream</h3>
          {events.length === 0 ? (
            <p className="text-slate-500 italic">No events recorded.</p>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-teal-400 font-bold">[{ev.type}]</span>
                  <span className="text-slate-200 font-semibold">{ev.agentId}</span>
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
