import React, { useState } from 'react';
import { PolicyGovernanceEngine } from '../../policy-governance/PolicyGovernanceEngine';
import { PolicyEvaluationResult, PolicySimulationResult, PolicyEvent } from '../../policy-governance/types';

export const PolicyInspectorTab: React.FC = () => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [activeSubView, setActiveSubView] = useState<'policies' | 'evaluator' | 'simulator' | 'audit' | 'events'>('policies');
  const [testOutput, setTestOutput] = useState<string | null>(null);

  // Evaluator Form State
  const [evalAction, setEvalAction] = useState<string>('execute_high_cost_mission');
  const [evalSpendUSD, setEvalSpendUSD] = useState<number>(150);
  const [evalRuntime, setEvalRuntime] = useState<string>('mission');
  const [evalResult, setEvalResult] = useState<PolicyEvaluationResult | null>(null);

  // Simulator Form State
  const [simScenario, setSimScenario] = useState<string>('Over-budget Mission Execution Test');
  const [simExpected, setSimExpected] = useState<string>('require_approval');
  const [simResult, setSimResult] = useState<PolicySimulationResult | null>(null);

  const engine = PolicyGovernanceEngine.getInstance();
  const registry = engine.getRegistry();
  const policies = registry.getAllPolicies();
  const metrics = engine.getMetrics();
  const auditEntries = engine.getAuditTrail();
  const events: PolicyEvent[] = engine.getEventLog();

  const handleEvaluateTest = () => {
    try {
      const res = engine.evaluate({
        action: evalAction,
        subjectId: 'founding_principal',
        sourceRuntime: evalRuntime,
        environment: { NODE_ENV: 'production' },
        parameters: { spendUSD: evalSpendUSD },
      });
      setEvalResult(res);
      setTestOutput(`Evaluated action '${evalAction}'. Decision: ${res.decision.toUpperCase()}`);
    } catch (err) {
      setTestOutput(`Evaluation Error: ${(err as Error).message}`);
    }
  };

  const handleRunSimulation = () => {
    try {
      const res = engine.simulate(
        simScenario,
        [],
        {
          action: 'execute_high_cost_mission',
          subjectId: 'founding_principal',
          sourceRuntime: 'mission',
          environment: {},
          parameters: { spendUSD: 150 },
        },
        simExpected as any
      );
      setSimResult(res);
      setTestOutput(`Simulation '${simScenario}' finished. Matched: ${res.matched ? 'YES' : 'NO'}`);
    } catch (err) {
      setTestOutput(`Simulation Error: ${(err as Error).message}`);
    }
  };

  const filteredPolicies = policies.filter((p) => {
    return selectedTypeFilter === 'ALL' || p.type === selectedTypeFilter;
  });

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Header Metrics Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h2 className="text-xl font-bold text-teal-400">Sidra Policy, Governance & Compliance Engine</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Single governance authority evaluating security, budget, AI agent bounds, and compliance rules
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Evaluations/sec</div>
            <div className="text-sm font-bold text-emerald-400">{metrics.evaluationsPerSec}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Allowed</div>
            <div className="text-sm font-bold text-teal-300">{metrics.allowedCount}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Approvals Req</div>
            <div className="text-sm font-bold text-amber-400">{metrics.approvalsRequiredCount}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Violations</div>
            <div className="text-sm font-bold text-rose-400">{metrics.policyViolationsCount}</div>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubView('policies')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'policies'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📋 Policy Registry ({filteredPolicies.length})
          </button>
          <button
            onClick={() => setActiveSubView('evaluator')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'evaluator'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🛡️ Interactive Evaluator
          </button>
          <button
            onClick={() => setActiveSubView('simulator')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'simulator'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🔄 Simulation Console
          </button>
          <button
            onClick={() => setActiveSubView('audit')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'audit'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📜 Audit Trail ({auditEntries.length})
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

      {/* Policy Registry Subview */}
      {activeSubView === 'policies' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs font-mono text-slate-300">Filter Policies by Category:</span>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs font-mono text-slate-200 uppercase"
            >
              {['ALL', 'security', 'permission', 'ai_agent', 'resource', 'execution', 'planning', 'mission', 'compliance'].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
            {filteredPolicies.map((pol) => (
              <div
                key={pol.id}
                onClick={() => setSelectedPolicyId(pol.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition space-y-3 shadow-lg ${
                  selectedPolicyId === pol.id
                    ? 'bg-teal-950/40 border-teal-500 text-teal-200 shadow-teal-500/10'
                    : 'bg-slate-900/80 border-slate-800 hover:bg-slate-900 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{pol.name}</h3>
                    <span className="text-[10px] text-slate-400">{pol.id} • v{pol.version}</span>
                  </div>
                  <span className="bg-teal-950 text-teal-300 border border-teal-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                    {pol.type}
                  </span>
                </div>

                <p className="text-slate-300 text-xs">{pol.description}</p>

                <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Policy Rules ({pol.rules.length}):</span>
                  {pol.rules.map((rule) => (
                    <div key={rule.id} className="text-[10px] flex justify-between items-center text-slate-300 pt-1">
                      <span>{rule.name}</span>
                      <span className={`font-bold uppercase ${rule.action === 'allow' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {rule.action}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evaluator Subview */}
      {activeSubView === 'evaluator' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">🛡️ Interactive Policy Rule Evaluator</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-slate-400">Target Action Name:</label>
              <input
                type="text"
                value={evalAction}
                onChange={(e) => setEvalAction(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Spend Amount ($ USD):</label>
              <input
                type="number"
                value={evalSpendUSD}
                onChange={(e) => setEvalSpendUSD(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Source Runtime:</label>
              <input
                type="text"
                value={evalRuntime}
                onChange={(e) => setEvalRuntime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono"
              />
            </div>
          </div>

          <button
            onClick={handleEvaluateTest}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
          >
            🛡️ Evaluate Policy Rules
          </button>

          {evalResult && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200">Evaluation Result: {evalResult.evaluationId}</span>
                <span
                  className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                    evalResult.decision === 'allow'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      : evalResult.decision === 'require_approval'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                      : 'bg-rose-950 text-rose-300 border border-rose-500/50'
                  }`}
                >
                  {evalResult.decision}
                </span>
              </div>
              <p className="text-slate-300">{evalResult.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Simulator Subview */}
      {activeSubView === 'simulator' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6 font-mono text-xs">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">🔄 Policy What-If Simulator</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-400">Scenario Title:</label>
              <input
                type="text"
                value={simScenario}
                onChange={(e) => setSimScenario(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400">Expected Policy Decision:</label>
              <select
                value={simExpected}
                onChange={(e) => setSimExpected(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-slate-100 font-mono uppercase"
              >
                {['allow', 'deny', 'require_approval', 'require_review', 'retry_later', 'escalate'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
          >
            🔄 Run Policy Simulation
          </button>

          {simResult && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-teal-300">{simResult.scenarioName}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${simResult.matched ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                  {simResult.matched ? 'Scenario MATCHED' : 'Scenario MISMATCH'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Expected: <strong>{simResult.expectedResult}</strong> | Actual: <strong>{simResult.actualResult}</strong>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Audit Trail Subview */}
      {activeSubView === 'audit' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Policy Decision Audit Trail ({auditEntries.length})</h3>
          {auditEntries.length === 0 ? (
            <p className="text-slate-500 italic p-4">Audit log empty. Evaluate policies in the evaluator tab!</p>
          ) : (
            auditEntries.map((aud) => (
              <div key={aud.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-teal-300">[{aud.result.toUpperCase()}] Policy: {aud.policyId}</span>
                  <p className="text-[10px] text-slate-400">{aud.contextSummary}</p>
                </div>
                <span className="text-[10px] text-slate-500">{aud.timestamp}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Event Stream Subview */}
      {activeSubView === 'events' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 mb-3 text-sm">Policy Governance Event Stream</h3>
          {events.length === 0 ? (
            <p className="text-slate-500 italic">No events recorded.</p>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-teal-400 font-bold">[{ev.type}]</span>
                  <span className="text-slate-200 font-semibold">{ev.policyId}</span>
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
