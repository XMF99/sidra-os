import React, { useState, useEffect } from 'react';
import { AutomationRuntime } from '../../automation-runtime/AutomationRuntime';
import { AutomationEvent } from '../../automation-runtime/types';

export const AutomationManagerTab: React.FC = () => {
  const [selectedTrigger, setSelectedTrigger] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [events, setEvents] = useState<AutomationEvent[]>([]);
  const [activeTabSubView, setActiveTabSubView] = useState<'list' | 'queue' | 'logs' | 'events'>('list');
  const [selectedAutomationId, setSelectedAutomationId] = useState<string | null>(null);

  const runtime = AutomationRuntime.getInstance();
  const allAutomations = runtime.getAllAutomations();
  const metrics = runtime.getMetrics();
  const queue = runtime.getExecutionQueue();
  const activeJobs = runtime.getActiveJobs();
  const history = runtime.getHistory(selectedAutomationId || undefined);

  useEffect(() => {
    setEvents(runtime.getEventLog());
    const unsubscribe = runtime.subscribe(() => {
      setEvents(runtime.getEventLog());
    });
    return () => unsubscribe();
  }, []);

  const triggerTypes = [
    'ALL',
    'manual',
    'time',
    'schedule',
    'cron',
    'connector_event',
    'mission_event',
    'workflow_event',
    'agent_event',
    'user_action',
    'system_event',
    'file_event',
    'webhook',
    'api_call',
  ];

  const filteredAutomations = allAutomations.filter((a) => {
    const matchesTrigger = selectedTrigger === 'ALL' || a.trigger.type === selectedTrigger;
    const matchesState = selectedState === 'ALL' || a.state === selectedState;
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTrigger && matchesState && matchesSearch;
  });

  const handleManualRun = (automationId: string) => {
    try {
      const job = runtime.triggerAutomation(automationId);
      setTestResult(`Triggered manual execution for '${automationId}' (Job ID: ${job.jobId})`);
    } catch (err) {
      setTestResult(`Execution Error: ${(err as Error).message}`);
    }
  };

  const handlePause = (automationId: string) => {
    runtime.pauseAutomation(automationId);
    setTestResult(`Paused automation '${automationId}'`);
  };

  const handleResume = (automationId: string) => {
    runtime.resumeAutomation(automationId);
    setTestResult(`Resumed automation '${automationId}'`);
  };

  const handleCancelJob = (jobId: string) => {
    runtime.cancelJob(jobId);
    setTestResult(`Cancelled job '${jobId}'`);
  };

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Header Metrics Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h2 className="text-xl font-bold text-teal-400">Sidra Automation Runtime</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Core execution platform for manual, scheduled, cron, event-driven, and conditional automations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Total Rules</div>
            <div className="text-sm font-bold text-slate-100">{metrics.totalAutomations}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Active</div>
            <div className="text-sm font-bold text-emerald-400">{metrics.activeAutomations}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Queue Depth</div>
            <div className="text-sm font-bold text-teal-300">{metrics.queuedJobsCount}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Executions</div>
            <div className="text-sm font-bold text-blue-400">{metrics.totalExecutions}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Avg Latency</div>
            <div className="text-sm font-bold text-amber-400">{metrics.averageExecutionDurationMs}ms</div>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTabSubView('list')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTabSubView === 'list'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📋 Automations List ({filteredAutomations.length})
          </button>
          <button
            onClick={() => setActiveTabSubView('queue')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTabSubView === 'queue'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            ⏳ Execution Queue ({activeJobs.length + queue.length})
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
            📜 Execution History Logs
          </button>
        </div>
      </div>

      {/* Console Banner Output */}
      {testResult && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex justify-between items-center ${
            testResult.includes('Triggered') || testResult.includes('Resumed')
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

      {/* Controls Filter Bar */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search automations by name, ID, description, or tags..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
        />

        <select
          value={selectedTrigger}
          onChange={(e) => setSelectedTrigger(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none uppercase font-mono"
        >
          {triggerTypes.map((tr) => (
            <option key={tr} value={tr}>
              Trigger: {tr}
            </option>
          ))}
        </select>

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none uppercase font-mono"
        >
          {['ALL', 'idle', 'scheduled', 'queued', 'running', 'completed', 'failed', 'paused'].map((st) => (
            <option key={st} value={st}>
              State: {st}
            </option>
          ))}
        </select>
      </div>

      {/* Automations List Subview */}
      {activeTabSubView === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAutomations.map((auto) => (
            <div
              key={auto.id}
              onClick={() => setSelectedAutomationId(auto.id)}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between space-y-4 shadow-lg cursor-pointer ${
                selectedAutomationId === auto.id
                  ? 'bg-slate-900 border-teal-500/80 shadow-teal-500/10'
                  : auto.enabled
                  ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{auto.name}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] font-mono text-teal-400 uppercase bg-teal-950/60 border border-teal-800 px-2 py-0.5 rounded-md">
                        {auto.trigger.type}
                      </span>
                      {auto.trigger.schedulePattern && (
                        <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {auto.trigger.schedulePattern}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-slate-500">Mode: {auto.executionMode}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono ${
                      auto.state === 'running'
                        ? 'bg-teal-950 text-teal-300 border border-teal-500/50 animate-pulse'
                        : auto.state === 'scheduled'
                        ? 'bg-blue-950 text-blue-300 border border-blue-500/50'
                        : auto.state === 'paused'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {auto.state}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{auto.description}</p>

                {/* Tags */}
                {auto.tags && (
                  <div className="flex gap-1 flex-wrap">
                    {auto.tags.map((tag) => (
                      <span key={tag} className="text-[9px] font-mono text-slate-400 bg-slate-950 border border-slate-800 px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Steps */}
              <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                <div className="text-[10px] font-mono text-slate-500 uppercase">Action Pipeline ({auto.actions.length} steps)</div>
                <div className="space-y-1">
                  {auto.actions.map((act, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-[11px] font-mono text-slate-300">
                      <span className="text-teal-400">{idx + 1}.</span>
                      <span className="text-slate-400 font-bold">[{act.type}]</span>
                      <span className="truncate text-slate-500">{act.targetId || act.commandString || act.notificationTitle || 'Step Action'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Controls */}
              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <div className="text-[10px] font-mono text-slate-500">
                  Priority: <span className="uppercase text-slate-300 font-bold">{auto.priority}</span>
                </div>

                <div className="flex gap-2">
                  {auto.enabled ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePause(auto.id);
                      }}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition"
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResume(auto.id);
                      }}
                      className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold transition"
                    >
                      Resume
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleManualRun(auto.id);
                    }}
                    className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
                  >
                    ▶ Run Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Execution Queue Subview */}
      {activeTabSubView === 'queue' && (
        <div className="space-y-6">
          {/* Active Jobs */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
            <h3 className="font-bold text-slate-200 text-sm mb-3">Active Executing Jobs ({activeJobs.length})</h3>
            {activeJobs.length === 0 ? (
              <p className="text-slate-500 italic">No active background jobs running currently.</p>
            ) : (
              activeJobs.map((job) => (
                <div key={job.jobId} className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-teal-300 font-bold text-sm">{job.automationName}</span>
                      <span className="text-[10px] text-slate-500 ml-2">Job: {job.jobId}</span>
                    </div>
                    <button
                      onClick={() => handleCancelJob(job.jobId)}
                      className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-lg text-xs hover:bg-rose-500/40"
                    >
                      Cancel Job
                    </button>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Progress: Step {job.currentStepIndex + 1} of {job.totalSteps}
                  </div>
                  <div className="bg-slate-900 p-2 rounded text-[10px] text-slate-400 max-h-24 overflow-y-auto space-y-1">
                    {job.logs.map((l, i) => (
                      <div key={i}>{l}</div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pending Queue */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
            <h3 className="font-bold text-slate-200 text-sm mb-3">Pending Queue ({queue.length})</h3>
            {queue.length === 0 ? (
              <p className="text-slate-500 italic">Queue is empty.</p>
            ) : (
              queue.map((job) => (
                <div key={job.jobId} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex justify-between items-center">
                  <div>
                    <span className="text-slate-200 font-bold">{job.automationName}</span>
                    <span className="text-[10px] text-teal-400 uppercase font-bold ml-2">Priority: {job.priority}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">{job.queuedAt}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Events Subview */}
      {activeTabSubView === 'events' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 mb-3 text-sm">Automation Event Stream</h3>
          {events.length === 0 ? (
            <p className="text-slate-500 italic">No events emitted yet.</p>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-teal-400 font-bold">[{ev.type}]</span>
                  <span className="text-slate-200 font-semibold">{ev.automationId}</span>
                  <span className="text-slate-400 text-[11px]">{JSON.stringify(ev.payload || {})}</span>
                </div>
                <span className="text-slate-500 text-[10px]">{ev.timestamp}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Logs & History Subview */}
      {activeTabSubView === 'logs' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-200 text-sm">
              Execution Logs & History Records {selectedAutomationId ? `for '${selectedAutomationId}'` : '(All)'}
            </h3>
            {selectedAutomationId && (
              <button onClick={() => setSelectedAutomationId(null)} className="text-xs text-teal-400 hover:underline">
                Show All Logs
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-slate-500 italic">No history records recorded yet.</p>
          ) : (
            history.map((rec) => (
              <div key={rec.jobId} className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200">{rec.automationName}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rec.state === 'completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : rec.state === 'failed'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {rec.state}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Job ID: {rec.jobId} | Queued: {rec.queuedAt} | Finished: {rec.finishedAt || 'In progress'}
                </div>
                <div className="bg-slate-900 p-2 rounded text-[10px] text-slate-400 space-y-1">
                  {rec.logs.map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
