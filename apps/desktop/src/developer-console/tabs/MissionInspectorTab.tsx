import React, { useState, useEffect } from 'react';
import { MissionRuntime } from '../../runtime/MissionRuntime';
import { MissionRegistry } from '../../runtime/MissionRegistry';
import { RuntimeEvent } from '../../runtime/types';

export const MissionInspectorTab: React.FC = () => {
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [events, setEvents] = useState<RuntimeEvent[]>([]);
  const [activeTabSubView, setActiveTabSubView] = useState<'missions' | 'templates' | 'events'>('missions');
  const [customTitle, setCustomTitle] = useState('');

  const runtime = MissionRuntime.getInstance();
  const registry = MissionRegistry.getInstance();
  const templates = registry.getAll();
  const missions = runtime.getAllRecords();
  const metrics = runtime.getMetrics();

  useEffect(() => {
    setEvents(runtime.getEventLog());
    const unsubscribe = runtime.subscribe(() => {
      setEvents(runtime.getEventLog());
    });
    return () => unsubscribe();
  }, []);

  const handleCreateFromTemplate = (templateId: string) => {
    try {
      const record = runtime.instantiateTemplate(templateId, customTitle.trim() || undefined);
      setSelectedMissionId(record.id);
      setActiveTabSubView('missions');
      setCustomTitle('');
      setTestResult(`Created strategic mission '${record.title}' (${record.id})`);
    } catch (err) {
      setTestResult(`Creation Error: ${(err as Error).message}`);
    }
  };

  const handleStartMission = (missionId: string) => {
    try {
      const record = runtime.startMission(missionId);
      setTestResult(`Started mission '${record.title}' (State: ${record.state})`);
    } catch (err) {
      setTestResult(`Start Error: ${(err as Error).message}`);
    }
  };

  const handlePauseMission = (missionId: string) => {
    runtime.pauseMission(missionId);
    setTestResult(`Paused mission '${missionId}'`);
  };

  const handleResumeMission = (missionId: string) => {
    runtime.resumeMission(missionId);
    setTestResult(`Resumed mission '${missionId}'`);
  };

  const handleCancelMission = (missionId: string) => {
    runtime.cancelMission(missionId);
    setTestResult(`Cancelled mission '${missionId}'`);
  };

  const handleArchiveMission = (missionId: string) => {
    runtime.archiveMission(missionId);
    setTestResult(`Archived mission '${missionId}'`);
  };

  const handleToggleObjective = (missionId: string, milestoneId: string, objectiveId: string) => {
    runtime.toggleObjective(missionId, milestoneId, objectiveId);
  };

  const filteredMissions = missions.filter((m) => {
    const matchesState = selectedStateFilter === 'ALL' || m.state === selectedStateFilter;
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesState && matchesSearch;
  });

  const selectedMission = missions.find((m) => m.id === selectedMissionId) || (missions.length > 0 ? missions[0] : null);

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Header Metrics Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="text-xl font-bold text-teal-400">Sidra Mission Runtime & Strategic Orchestrator</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Highest strategic orchestration layer managing business objectives, milestones, critical paths, and cross-runtime coordination
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Total Missions</div>
            <div className="text-sm font-bold text-slate-100">{metrics.totalMissions}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Active</div>
            <div className="text-sm font-bold text-emerald-400">{metrics.activeMissions}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Success Rate</div>
            <div className="text-sm font-bold text-teal-300">{metrics.successRate}%</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Avg Time</div>
            <div className="text-sm font-bold text-amber-400">{metrics.averageCompletionTimeHours}h</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-view Tabs */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTabSubView('missions')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTabSubView === 'missions'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📋 Strategic Missions ({filteredMissions.length})
          </button>
          <button
            onClick={() => setActiveTabSubView('templates')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTabSubView === 'templates'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📚 Mission Templates ({templates.length})
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

      {/* Output Console Banner */}
      {testResult && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex justify-between items-center ${
            testResult.includes('Created') || testResult.includes('Started')
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

      {/* Filter Bar */}
      {activeTabSubView === 'missions' && (
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search missions by title, ID, category..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
          />
        </div>
      )}

      {/* Templates Subview */}
      {activeTabSubView === 'templates' && (
        <div className="space-y-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Optional custom mission title..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {templates.map((tmpl) => (
              <div key={tmpl.id} className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between shadow-lg">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-100 text-sm">{tmpl.title}</h3>
                    <span className="text-[10px] font-mono text-teal-400 uppercase bg-teal-950 border border-teal-800 px-2 py-0.5 rounded-md">
                      {tmpl.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-3">{tmpl.description}</p>
                  <div className="text-[10px] font-mono text-slate-500">Milestones: {tmpl.milestones.length} phases</div>
                </div>

                <button
                  onClick={() => handleCreateFromTemplate(tmpl.id)}
                  className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
                >
                  🎯 Launch Strategic Mission
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strategic Missions List & Details Subview */}
      {activeTabSubView === 'missions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Missions List */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 max-h-[750px] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 text-sm">Strategic Missions</h3>
              <select
                value={selectedStateFilter}
                onChange={(e) => setSelectedStateFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-300 uppercase font-mono"
              >
                {['ALL', 'draft', 'planned', 'running', 'paused', 'completed', 'failed', 'archived'].map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {filteredMissions.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMissionId(m.id)}
                className={`p-4 rounded-xl border cursor-pointer transition space-y-2 ${
                  selectedMission?.id === m.id
                    ? 'bg-teal-950/40 border-teal-500 text-teal-200 shadow-teal-500/10'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/80 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-slate-100">{m.title}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{m.id} • {m.category}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      m.state === 'running'
                        ? 'bg-teal-950 text-teal-300 border border-teal-500/50 animate-pulse'
                        : m.state === 'completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : m.state === 'paused'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {m.state}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Progress</span>
                    <span>{m.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-teal-400 h-1.5 rounded-full transition-all duration-300" style={{ width: `${m.progressPercent}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Mission Manager Inspector Dashboard */}
          <div className="lg:col-span-2 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
            {selectedMission ? (
              <>
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-xl font-bold text-teal-300">{selectedMission.title}</h3>
                      <span className="text-xs font-mono uppercase bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-md text-slate-300">
                        {selectedMission.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{selectedMission.description}</p>
                  </div>

                  <div className="flex gap-2">
                    {selectedMission.state === 'draft' || selectedMission.state === 'planned' || selectedMission.state === 'ready' ? (
                      <button
                        onClick={() => handleStartMission(selectedMission.id)}
                        className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
                      >
                        ▶ Start Mission
                      </button>
                    ) : selectedMission.state === 'running' ? (
                      <button
                        onClick={() => handlePauseMission(selectedMission.id)}
                        className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold"
                      >
                        Pause
                      </button>
                    ) : selectedMission.state === 'paused' ? (
                      <button
                        onClick={() => handleResumeMission(selectedMission.id)}
                        className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold"
                      >
                        Resume
                      </button>
                    ) : null}

                    <button
                      onClick={() => handleCancelMission(selectedMission.id)}
                      className="px-3 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleArchiveMission(selectedMission.id)}
                      className="px-3 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
                    >
                      Archive
                    </button>
                  </div>
                </div>

                {/* Progress & Milestone Objectives Timeline */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-xs text-slate-300 uppercase font-mono">Milestones & Objectives Checklist</h4>
                    <span className="text-xs font-mono text-teal-400">Est. Remaining: {selectedMission.estimatedHoursRemaining || 0} hrs</span>
                  </div>

                  <div className="space-y-4">
                    {selectedMission.milestones.map((m) => (
                      <div key={m.id} className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-2">
                        <div className="flex justify-between items-center">
                          <h5 className="font-bold text-xs text-slate-200">{m.title}</h5>
                          <span className="text-[10px] font-mono text-slate-400">Due: {m.dueDate}</span>
                        </div>
                        <div className="space-y-1.5 pt-1">
                          {m.objectives.map((obj) => (
                            <div key={obj.id} className="flex items-center space-x-3 text-xs font-mono text-slate-300">
                              <input
                                type="checkbox"
                                checked={obj.completed}
                                onChange={() => handleToggleObjective(selectedMission.id, m.id, obj.id)}
                                className="w-4 h-4 rounded bg-slate-900 border-slate-800 text-teal-500 focus:ring-teal-500 cursor-pointer"
                              />
                              <span className={obj.completed ? 'line-through text-slate-500' : 'text-slate-200'}>{obj.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Multi-Runtime Coordination Badges */}
                <div className="grid grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 font-mono text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-500 uppercase text-[10px] font-bold">Assigned Agents</span>
                    <div className="flex gap-1 flex-wrap">
                      {selectedMission.assignedAgentIds.length > 0 ? (
                        selectedMission.assignedAgentIds.map((ag) => (
                          <span key={ag} className="text-[10px] bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded">
                            🤖 {ag}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-600 text-[10px] italic">Auto-assigned on start</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 uppercase text-[10px] font-bold">Linked Workflows</span>
                    <div className="flex gap-1 flex-wrap">
                      {selectedMission.linkedWorkflowIds.map((wf) => (
                        <span key={wf} className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded">
                          🔄 {wf}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 uppercase text-[10px] font-bold">Linked Automations</span>
                    <div className="flex gap-1 flex-wrap">
                      {selectedMission.linkedAutomationIds.map((auto) => (
                        <span key={auto} className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
                          ⚡ {auto}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 uppercase text-[10px] font-bold">Required Connectors</span>
                    <div className="flex gap-1 flex-wrap">
                      {selectedMission.requiredConnectorIds.map((conn) => (
                        <span key={conn} className="text-[10px] bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">
                          🔌 {conn}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Context Variables Viewer */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-300 uppercase font-mono">Execution Context Variables</h4>
                  <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-teal-300 overflow-x-auto">
                    {JSON.stringify(selectedMission.context, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-500 italic">Select a strategic mission to inspect objectives, milestones, and multi-runtime bindings.</div>
            )}
          </div>
        </div>
      )}

      {/* Event Stream Subview */}
      {activeTabSubView === 'events' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 mb-3 text-sm">Mission Runtime Event Stream</h3>
          {events.length === 0 ? (
            <p className="text-slate-500 italic">No events recorded.</p>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-teal-400 font-bold">[{ev.type}]</span>
                  <span className="text-slate-200 font-semibold">{ev.missionId}</span>
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
