import React, { useState, useEffect } from 'react';
import { ExecutionCoordinationEngine } from '../../execution-coordination/ExecutionCoordinationEngine';
import { ExecutionEvent, ExecutionSession } from '../../execution-coordination/types';

export const ExecutionInspectorTab: React.FC = () => {
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>('ALL');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [events, setEvents] = useState<ExecutionEvent[]>([]);
  const [activeSubView, setActiveSubView] = useState<'sessions' | 'tasks' | 'recovery' | 'events'>('sessions');
  const [testOutput, setTestOutput] = useState<string | null>(null);

  const engine = ExecutionCoordinationEngine.getInstance();
  const registry = engine.getRegistry();
  const sessions = engine.getExecutionHistory();
  const metrics = engine.getMetrics();
  const recoveryActions = registry.getRecoveryActions();

  useEffect(() => {
    setEvents(engine.getEventLog());
    const unsubscribe = engine.subscribe(() => {
      setEvents(engine.getEventLog());
    });
    return () => unsubscribe();
  }, []);

  const handleStartSession = () => {
    try {
      const session = engine.startExecution('PLN-101');
      setSelectedSessionId(session.id);
      setActiveSubView('sessions');
      setTestOutput(`Started Execution Session '${session.id}' for plan '${session.planTitle}'.`);
    } catch (err) {
      setTestOutput(`Execution Error: ${(err as Error).message}`);
    }
  };

  const handlePauseSession = (sessionId: string) => {
    try {
      engine.pauseExecution(sessionId);
      setTestOutput(`Paused session '${sessionId}'`);
    } catch (err) {
      setTestOutput(`Pause Error: ${(err as Error).message}`);
    }
  };

  const handleResumeSession = (sessionId: string) => {
    try {
      engine.resumeExecution(sessionId);
      setTestOutput(`Resumed session '${sessionId}'`);
    } catch (err) {
      setTestOutput(`Resume Error: ${(err as Error).message}`);
    }
  };

  const handleCancelSession = (sessionId: string) => {
    try {
      engine.cancelExecution(sessionId);
      setTestOutput(`Cancelled session '${sessionId}'`);
    } catch (err) {
      setTestOutput(`Cancel Error: ${(err as Error).message}`);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    return selectedStateFilter === 'ALL' || s.state === selectedStateFilter;
  });

  const selectedSession: ExecutionSession | null = sessions.find((s) => s.id === selectedSessionId) || (sessions.length > 0 ? sessions[0] : null);

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Header Metrics Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚡</span>
            <div>
              <h2 className="text-xl font-bold text-teal-400">Sidra Execution Coordination Engine</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Runtime orchestrator coordinating task dispatching, parallel execution, retries, and recovery across all runtimes
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Running</div>
            <div className="text-sm font-bold text-emerald-400">{metrics.runningSessionsCount}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Completed</div>
            <div className="text-sm font-bold text-teal-300">{metrics.completedSessionsCount}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Avg Duration</div>
            <div className="text-sm font-bold text-amber-400">{metrics.averageExecutionDurationMs}ms</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Success Rate</div>
            <div className="text-sm font-bold text-blue-400">{metrics.executionSuccessRatePercent}%</div>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubView('sessions')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'sessions'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📋 Active Sessions ({filteredSessions.length})
          </button>
          <button
            onClick={() => setActiveSubView('tasks')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'tasks'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🧩 Live Dispatched Tasks
          </button>
          <button
            onClick={() => setActiveSubView('recovery')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'recovery'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🛡️ Failure & Recovery Log ({recoveryActions.length})
          </button>
          <button
            onClick={() => setActiveSubView('events')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'events'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📡 Event Stream ({events.length})
          </button>
        </div>

        <button
          onClick={handleStartSession}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
        >
          ▶ Start New Execution Session
        </button>
      </div>

      {/* Output Banner */}
      {testOutput && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-mono flex justify-between items-center">
          <span>{testOutput}</span>
          <button onClick={() => setTestOutput(null)} className="text-slate-400 hover:text-slate-200 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Sessions Subview */}
      {activeSubView === 'sessions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Sessions List */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 max-h-[750px] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 text-sm">Execution Sessions</h3>
              <select
                value={selectedStateFilter}
                onChange={(e) => setSelectedStateFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-300 font-mono uppercase"
              >
                {['ALL', 'running', 'paused', 'completed', 'cancelled', 'failed'].map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {filteredSessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedSessionId(s.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                  selectedSession?.id === s.id
                    ? 'bg-teal-950/40 border-teal-500 text-teal-200 shadow-teal-500/10'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/80 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-slate-100">{s.planTitle}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{s.id} • Plan: {s.planId}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      s.state === 'running'
                        ? 'bg-teal-950 text-teal-300 border border-teal-500/50 animate-pulse'
                        : s.state === 'completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : s.state === 'paused'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {s.state}
                  </span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <div className="bg-teal-400 h-full rounded-full transition-all" style={{ width: `${s.progressPercent}%` }} />
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                  <span>Progress: <span className="text-teal-400 font-bold">{s.progressPercent}%</span></span>
                  <span>Tasks: {s.completedTaskIds.length}/{s.dispatchedTasks.length}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Selected Session Inspector */}
          <div className="lg:col-span-2 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
            {selectedSession ? (
              <>
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-teal-300">{selectedSession.planTitle}</h3>
                    <p className="text-xs text-slate-400">Session ID: {selectedSession.id} | Plan: {selectedSession.planId}</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedSession.state === 'running' ? (
                      <button
                        onClick={() => handlePauseSession(selectedSession.id)}
                        className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold"
                      >
                        Pause
                      </button>
                    ) : selectedSession.state === 'paused' ? (
                      <button
                        onClick={() => handleResumeSession(selectedSession.id)}
                        className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold"
                      >
                        Resume
                      </button>
                    ) : null}

                    {selectedSession.state === 'running' || selectedSession.state === 'paused' ? (
                      <button
                        onClick={() => handleCancelSession(selectedSession.id)}
                        className="px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold"
                      >
                        Cancel Session
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Progress Bar & Runtimes */}
                <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Execution Progress</span>
                    <span className="text-teal-300 font-bold">{selectedSession.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                    <div className="bg-teal-400 h-full rounded-full transition-all" style={{ width: `${selectedSession.progressPercent}%` }} />
                  </div>
                  <div className="flex gap-1.5 pt-2 flex-wrap font-mono text-[10px]">
                    <span className="text-slate-500 uppercase font-bold">Active Runtimes:</span>
                    {selectedSession.activeRuntimes.map((rt) => (
                      <span key={rt} className="bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded font-bold uppercase">
                        ⚡ {rt}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Dispatched Tasks List */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-300 font-mono uppercase">Dispatched Task Tokens</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {selectedSession.dispatchedTasks.map((tok) => (
                      <div key={tok.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono flex justify-between items-center">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-200">{tok.taskTitle}</span>
                            <span className="text-[9px] bg-slate-900 text-teal-300 border border-slate-800 px-1.5 py-0.5 rounded uppercase">
                              {tok.runtime}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">ID: {tok.id} | Task: {tok.taskId}</span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tok.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : tok.status === 'running'
                              ? 'bg-teal-950 text-teal-300 border border-teal-800 animate-pulse'
                              : tok.status === 'failed'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {tok.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-500 italic">Select an execution session to inspect dispatched tasks and session controls.</div>
            )}
          </div>
        </div>
      )}

      {/* Dispatched Tasks Grid Subview */}
      {activeSubView === 'tasks' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Live Dispatched Tasks Grid Across Runtimes</h3>
          {selectedSession ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedSession.dispatchedTasks.map((tok) => (
                <div key={tok.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-100">{tok.taskTitle}</span>
                    <span className="text-[9px] font-bold uppercase bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded">
                      {tok.runtime}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Dispatched At: {tok.dispatchedAt} | Status: <strong className="text-teal-300">{tok.status}</strong>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">Select a session to view dispatched task tokens.</p>
          )}
        </div>
      )}

      {/* Failure & Recovery Subview */}
      {activeSubView === 'recovery' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Failure Detection & Recovery Action Logs ({recoveryActions.length})</h3>
          {recoveryActions.length === 0 ? (
            <p className="text-slate-500 italic">No failure recovery actions recorded. Platform runtimes executing cleanly!</p>
          ) : (
            recoveryActions.map((rec) => (
              <div key={rec.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-300">[{rec.actionType.toUpperCase()}] Task: {rec.taskId}</span>
                  <span className="text-[10px] text-slate-500">{rec.triggeredAt}</span>
                </div>
                <p className="text-[10px] text-slate-400">{rec.reason}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Event Stream Subview */}
      {activeSubView === 'events' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 mb-3 text-sm">Execution Coordination Event Stream</h3>
          {events.length === 0 ? (
            <p className="text-slate-500 italic">No events recorded.</p>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-teal-400 font-bold">[{ev.type}]</span>
                  <span className="text-slate-200 font-semibold">{ev.sessionId}</span>
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
