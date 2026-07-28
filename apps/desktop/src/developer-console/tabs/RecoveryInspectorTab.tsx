import React, { useState } from 'react';
import { ResilienceRecoveryEngine } from '../../resilience-recovery/ResilienceRecoveryEngine';
import { FailureType, RecoveryJournalEntry } from '../../resilience-recovery/types';

export const RecoveryInspectorTab: React.FC = () => {
  const [selectedRuntimeFilter, setSelectedRuntimeFilter] = useState<string>('ALL');
  const [activeSubView, setActiveSubView] = useState<'runtimes' | 'breakers' | 'journal' | 'checkpoints' | 'simulator'>('runtimes');
  const [testOutput, setTestOutput] = useState<string | null>(null);

  // Simulator Form State
  const [simRuntime, setSimRuntime] = useState<string>('connector');
  const [simFailureType, setSimFailureType] = useState<FailureType>('connector_failure');
  const [lastRecoveryRes, setLastRecoveryRes] = useState<RecoveryJournalEntry | null>(null);

  // Checkpoint Form State
  const [chkDescription, setChkDescription] = useState<string>('Pre-Execution State Checkpoint');

  const engine = ResilienceRecoveryEngine.getInstance();
  const breakers = engine.getAllCircuitBreakers();
  const checkpoints = engine.getAllCheckpoints();
  const journal = engine.getRecoveryHistory();
  const metrics = engine.getMetrics();

  const handleRestartRuntime = (runtimeId: string) => {
    try {
      engine.restartRuntime(runtimeId);
      setTestOutput(`Restarted runtime '${runtimeId}' and reset circuit breaker.`);
    } catch (err) {
      setTestOutput(`Restart Error: ${(err as Error).message}`);
    }
  };

  const handleSimulateFailure = () => {
    try {
      const entry = engine.recover(simRuntime, simFailureType);
      setLastRecoveryRes(entry);
      setTestOutput(`Simulated '${simFailureType}' on runtime '${simRuntime}'. Strategy: ${entry.strategyUsed.toUpperCase()}`);
    } catch (err) {
      setTestOutput(`Simulation Error: ${(err as Error).message}`);
    }
  };

  const handleCreateCheckpoint = () => {
    try {
      const chk = engine.createCheckpoint('execution', chkDescription);
      setTestOutput(`Created Checkpoint '${chk.id}' (${chk.description}).`);
    } catch (err) {
      setTestOutput(`Checkpoint Error: ${(err as Error).message}`);
    }
  };

  const handleRestoreCheckpoint = (chkId: string) => {
    try {
      const chk = engine.restoreCheckpoint(chkId);
      setTestOutput(`Restored State Checkpoint '${chk.id}'.`);
    } catch (err) {
      setTestOutput(`Restore Error: ${(err as Error).message}`);
    }
  };

  const filteredJournal = journal.filter((j) => {
    return selectedRuntimeFilter === 'ALL' || j.runtimeId === selectedRuntimeFilter;
  });

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Header Metrics Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔄</span>
            <div>
              <h2 className="text-xl font-bold text-teal-400">Sidra Resilience, Recovery & Reliability Engine</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                System availability & fault-tolerance engine controlling circuit breakers, automated recovery, checkpoints, and MTTR telemetry
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Success Rate</div>
            <div className="text-sm font-bold text-emerald-400">{metrics.recoverySuccessRatePercent}%</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">MTTR</div>
            <div className="text-sm font-bold text-teal-300">{metrics.meanTimeToRecoveryMs}ms</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Restarts</div>
            <div className="text-sm font-bold text-amber-400">{metrics.runtimeRestartsCount}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Availability</div>
            <div className="text-sm font-bold text-blue-400">{metrics.platformAvailabilityPercent}%</div>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubView('runtimes')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'runtimes'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            💚 Runtime Status & Restarts ({breakers.length})
          </button>
          <button
            onClick={() => setActiveSubView('breakers')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'breakers'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            ⚡ Circuit Breakers ({breakers.filter((b) => b.state === 'open').length} Open)
          </button>
          <button
            onClick={() => setActiveSubView('journal')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'journal'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📜 Recovery Journal ({journal.length})
          </button>
          <button
            onClick={() => setActiveSubView('checkpoints')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'checkpoints'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📸 Checkpoints & Snapshots ({checkpoints.length})
          </button>
          <button
            onClick={() => setActiveSubView('simulator')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'simulator'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🧪 Interactive Failure Simulator
          </button>
        </div>
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

      {/* Runtime Status Subview */}
      {activeSubView === 'runtimes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
          {breakers.map((b) => (
            <div key={b.targetRuntime} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-slate-100 uppercase">{b.targetRuntime} Runtime</h3>
                  <span className="text-[10px] text-slate-400">Target: {b.targetRuntime}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    b.state === 'closed'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      : 'bg-rose-950 text-rose-300 border border-rose-500/50'
                  }`}
                >
                  {b.state === 'closed' ? 'OPERATIONAL' : b.state}
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                <span>Failures Recorded: <strong className="text-slate-200">{b.failureCount}</strong></span>
                <span>Probe Threshold: <strong className="text-teal-300">{b.successThreshold}</strong></span>
              </div>

              <button
                onClick={() => handleRestartRuntime(b.targetRuntime)}
                className="w-full py-2 bg-teal-500/20 hover:bg-teal-500/40 text-teal-300 border border-teal-500/40 rounded-xl font-semibold transition text-xs"
              >
                🔄 Restart Runtime
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Circuit Breakers Subview */}
      {activeSubView === 'breakers' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Platform Runtime Circuit Breakers</h3>
          <div className="space-y-3">
            {breakers.map((b) => (
              <div key={b.targetRuntime} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-teal-300 uppercase">{b.targetRuntime} Runtime</span>
                  <p className="text-[10px] text-slate-400">
                    State: <strong className={b.state === 'closed' ? 'text-emerald-400' : 'text-rose-400'}>{b.state.toUpperCase()}</strong> | Failures: {b.failureCount} | Last Change: {b.lastStateChangeAt}
                  </p>
                </div>

                <button
                  onClick={() => handleRestartRuntime(b.targetRuntime)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-200"
                >
                  Reset Breaker
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recovery Journal Subview */}
      {activeSubView === 'journal' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-300">Filter Journal by Runtime:</span>
            <select
              value={selectedRuntimeFilter}
              onChange={(e) => setSelectedRuntimeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-slate-200 uppercase"
            >
              <option value="ALL">ALL RUNTIMES</option>
              {breakers.map((b) => (
                <option key={b.targetRuntime} value={b.targetRuntime}>
                  {b.targetRuntime}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Recovery Journal Entries</h3>
            {filteredJournal.length === 0 ? (
              <p className="text-slate-500 italic p-4">No recovery entries recorded.</p>
            ) : (
              filteredJournal.map((j) => (
                <div key={j.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-teal-300 uppercase">[{j.runtimeId}]</span>
                      <span className="text-slate-100 font-semibold">{j.failureType}</span>
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-amber-300 px-2 py-0.5 rounded uppercase font-bold">
                        Strategy: {j.strategyUsed}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{j.reason}</p>
                  </div>

                  <span className="text-[10px] text-slate-500 font-bold">{j.durationMs}ms</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Checkpoints Subview */}
      {activeSubView === 'checkpoints' && (
        <div className="space-y-6 font-mono text-xs">
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-200 text-sm">📸 Create New State Checkpoint</h3>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={chkDescription}
                onChange={(e) => setChkDescription(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono text-xs"
              />
              <button
                onClick={handleCreateCheckpoint}
                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                📸 Create Checkpoint
              </button>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Active Checkpoints ({checkpoints.length})</h3>
            {checkpoints.map((chk) => (
              <div key={chk.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-teal-300">{chk.id}</span>
                  <p className="text-slate-300 font-semibold text-xs mt-0.5">{chk.description}</p>
                  <span className="text-[10px] text-slate-500">Created: {chk.createdAt}</span>
                </div>

                <button
                  onClick={() => handleRestoreCheckpoint(chk.id)}
                  className="px-4 py-2 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-xl font-bold hover:bg-teal-500/40"
                >
                  🔄 Restore Checkpoint
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failure Simulator Subview */}
      {activeSubView === 'simulator' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6 font-mono text-xs">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">🧪 Interactive Failure & Recovery Simulator</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-slate-300">Target Platform Runtime:</label>
              <select
                value={simRuntime}
                onChange={(e) => setSimRuntime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono"
              >
                {breakers.map((b) => (
                  <option key={b.targetRuntime} value={b.targetRuntime}>
                    {b.targetRuntime.toUpperCase()} RUNTIME
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-slate-300">Synthetic Failure Type:</label>
              <select
                value={simFailureType}
                onChange={(e) => setSimFailureType(e.target.value as FailureType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono uppercase"
              >
                {['runtime_crash', 'connector_failure', 'timeout', 'deadlock', 'resource_exhaustion', 'network_failure', 'permission_failure', 'policy_failure'].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSimulateFailure}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
          >
            ⚡ Simulate Failure & Recover
          </button>

          {lastRecoveryRes && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-teal-300">Automated Recovery Outcome</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {lastRecoveryRes.result}
                </span>
              </div>
              <p className="text-slate-300 text-xs">{lastRecoveryRes.reason}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
