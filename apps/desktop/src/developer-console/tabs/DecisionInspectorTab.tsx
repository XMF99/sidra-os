import React, { useState, useEffect } from 'react';
import { DecisionEngine } from '../../decision-engine/DecisionEngine';
import { DecisionEvent, DecisionCandidate, DecisionType } from '../../decision-engine/types';

export const DecisionInspectorTab: React.FC = () => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [events, setEvents] = useState<DecisionEvent[]>([]);
  const [activeSubView, setActiveSubView] = useState<'history' | 'tester' | 'catalog' | 'events'>('history');
  const [testOutput, setTestOutput] = useState<string | null>(null);

  // Decision Tester State
  const [testType, setTestType] = useState<DecisionType>('model_selection');
  const [cand1Name, setCand1Name] = useState('OpenRouter Anthropic Claude 3.5');
  const [cand1Cost, setCand1Cost] = useState(0.015);
  const [cand1Risk, setCand1Risk] = useState(5);
  const [cand1Latency, setCand1Latency] = useState(650);

  const [cand2Name, setCand2Name] = useState('Ollama Local Llama-3 70B');
  const [cand2Cost, setCand2Cost] = useState(0.0);
  const [cand2Risk, setCand2Risk] = useState(15);
  const [cand2Latency, setCand2Latency] = useState(1400);

  const engine = DecisionEngine.getInstance();
  const registry = engine.getRegistry();
  const history = engine.getDecisionHistory();
  const metrics = engine.getMetrics();
  const policies = registry.getAllPolicies();
  const constraints = registry.getAllConstraints();

  useEffect(() => {
    setEvents(engine.getEventLog());
    const unsubscribe = engine.subscribe(() => {
      setEvents(engine.getEventLog());
    });
    return () => unsubscribe();
  }, []);

  const handleRunEvaluation = () => {
    const candidates: DecisionCandidate[] = [
      {
        id: 'cand_1',
        name: cand1Name.trim() || 'Option A',
        description: 'Primary high-performance option',
        parameters: {},
        estimatedCost: cand1Cost,
        estimatedRisk: cand1Risk,
        estimatedLatencyMs: cand1Latency,
        complexity: 3,
        confidence: 0.95,
        businessValue: 90,
      },
      {
        id: 'cand_2',
        name: cand2Name.trim() || 'Option B',
        description: 'Secondary offline/fallback option',
        parameters: {},
        estimatedCost: cand2Cost,
        estimatedRisk: cand2Risk,
        estimatedLatencyMs: cand2Latency,
        complexity: 2,
        confidence: 0.85,
        businessValue: 75,
      },
    ];

    const reqId = `REQ-DEC-${Math.floor(100 + Math.random() * 900)}`;
    const result = engine.requestDecision({
      id: reqId,
      decisionType: testType,
      requesterId: 'DevConsoleTester',
      requesterType: 'user',
      context: { test: true },
      candidates,
      requestedAt: new Date().toISOString(),
    });

    setSelectedResultId(result.requestId);
    setTestOutput(`Decision Evaluated: Selected '${result.explanation.selectedCandidateName}' with Score ${result.score}/100 (${result.status.toUpperCase()})`);
  };

  const filteredHistory = history.filter((h) => {
    return selectedTypeFilter === 'ALL' || h.decisionType === selectedTypeFilter;
  });

  const selectedResult = history.find((h) => h.requestId === selectedResultId) || (history.length > 0 ? history[0] : null);

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Header Metrics Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <h2 className="text-xl font-bold text-teal-400">Sidra Decision Engine & Analytical Evaluator</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Analytical layer evaluating options, multi-criteria scoring, policy guardrails, and candidate ranking
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Evaluated</div>
            <div className="text-sm font-bold text-slate-100">{metrics.totalDecisionsEvaluated}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Confidence</div>
            <div className="text-sm font-bold text-emerald-400">{metrics.averageConfidencePercent}%</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Latency</div>
            <div className="text-sm font-bold text-teal-300">{metrics.averageDecisionLatencyMs}ms</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Throughput</div>
            <div className="text-sm font-bold text-blue-400">{metrics.decisionThroughputPerMin}/m</div>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubView('history')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'history'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📋 Evaluated History ({filteredHistory.length})
          </button>
          <button
            onClick={() => setActiveSubView('tester')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'tester'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            ⚡ Decision Request Tester
          </button>
          <button
            onClick={() => setActiveSubView('catalog')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'catalog'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📜 Policies & Constraints Catalog
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

      {/* History Subview */}
      {activeSubView === 'history' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Requests List */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 max-h-[750px] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 text-sm">Decision History</h3>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-300 font-mono uppercase"
              >
                {['ALL', 'connector_selection', 'model_selection', 'resource_allocation', 'strategic', 'risk'].map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {filteredHistory.map((h) => (
              <div
                key={h.requestId}
                onClick={() => setSelectedResultId(h.requestId)}
                className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                  selectedResult?.requestId === h.requestId
                    ? 'bg-teal-950/40 border-teal-500 text-teal-200 shadow-teal-500/10'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/80 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-slate-100">{h.explanation.selectedCandidateName}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{h.requestId} • {h.decisionType}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      h.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : h.status === 'conditional'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/50'
                    }`}
                  >
                    {h.status}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                  <span>Score: <span className="text-teal-400 font-bold">{h.score}/100</span></span>
                  <span>Candidates: {h.explanation.alternativesCount}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Selected Decision Inspector */}
          <div className="lg:col-span-2 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
            {selectedResult ? (
              <>
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-teal-300">
                      Winner: {selectedResult.explanation.selectedCandidateName}
                    </h3>
                    <p className="text-xs text-slate-400">Request: {selectedResult.requestId} | Type: {selectedResult.decisionType}</p>
                  </div>
                  <span className="text-xs font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800 px-3 py-1 rounded-xl">
                    Final Score: {selectedResult.score}/100
                  </span>
                </div>

                {/* Rationale Explanation Box */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Structured Explanation & Rationale</span>
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 leading-relaxed">
                    {selectedResult.explanation.rationale}
                  </div>
                </div>

                {/* Candidate Score Breakdown Table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-300 font-mono uppercase">Candidates Score Breakdown & Ranking</h4>
                  <div className="space-y-2">
                    {selectedResult.explanation.candidatesBreakdown.map((b) => (
                      <div key={b.candidateId} className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200">{b.candidateName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.passed ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'}`}>
                            Score: {b.rawScore}/100 {b.passed ? '✓ PASSED' : '✕ VIOLATION'}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div className="bg-teal-500 h-full rounded-full transition-all" style={{ width: `${b.rawScore}%` }} />
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-[10px] text-slate-400 pt-1">
                          <span>Cost Score: {b.costScore}</span>
                          <span>Risk Score: {b.riskScore}</span>
                          <span>Latency Score: {b.latencyScore}</span>
                          <span>Value Score: {b.businessValueScore}</span>
                        </div>

                        {b.policyViolations.length > 0 && (
                          <div className="text-[10px] text-amber-400">
                            ⚠️ Policy Violations: {b.policyViolations.join('; ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-500 italic">Select an evaluated decision request to inspect score breakdowns and explanations.</div>
            )}
          </div>
        </div>
      )}

      {/* Decision Request Tester Subview */}
      {activeSubView === 'tester' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">⚡ Interactive Decision Evaluator</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Candidate 1 */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-xs text-teal-300 font-mono uppercase">Option A Candidate</h4>
              <input
                type="text"
                value={cand1Name}
                onChange={(e) => setCand1Name(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
              />
              <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                <div>
                  <label className="text-slate-400">Cost ($)</label>
                  <input type="number" step="0.001" value={cand1Cost} onChange={(e) => setCand1Cost(parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-400">Risk (0-100)</label>
                  <input type="number" value={cand1Risk} onChange={(e) => setCand1Risk(parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-400">Latency (ms)</label>
                  <input type="number" value={cand1Latency} onChange={(e) => setCand1Latency(parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100" />
                </div>
              </div>
            </div>

            {/* Candidate 2 */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-xs text-blue-300 font-mono uppercase">Option B Candidate</h4>
              <input
                type="text"
                value={cand2Name}
                onChange={(e) => setCand2Name(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100"
              />
              <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
                <div>
                  <label className="text-slate-400">Cost ($)</label>
                  <input type="number" step="0.001" value={cand2Cost} onChange={(e) => setCand2Cost(parseFloat(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-400">Risk (0-100)</label>
                  <input type="number" value={cand2Risk} onChange={(e) => setCand2Risk(parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100" />
                </div>
                <div>
                  <label className="text-slate-400">Latency (ms)</label>
                  <input type="number" value={cand2Latency} onChange={(e) => setCand2Latency(parseInt(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-100" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-t border-slate-800 pt-4">
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-slate-200 uppercase"
            >
              {['model_selection', 'connector_selection', 'resource_allocation', 'strategic', 'risk'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <button
              onClick={handleRunEvaluation}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
            >
              ⚡ Evaluate Decision
            </button>
          </div>
        </div>
      )}

      {/* Catalog Subview */}
      {activeSubView === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
            <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Active Organizational Policies ({policies.length})</h3>
            {policies.map((p) => (
              <div key={p.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex justify-between text-teal-300 font-bold">
                  <span>{p.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{p.category}</span>
                </div>
                <p className="text-[10px] text-slate-400">{p.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
            <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Active Decision Constraints ({constraints.length})</h3>
            {constraints.map((c) => (
              <div key={c.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex justify-between text-blue-300 font-bold">
                  <span>{c.name}</span>
                  <span className="text-[10px] text-slate-500 uppercase">{c.type}</span>
                </div>
                <p className="text-[10px] text-slate-400">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Stream Subview */}
      {activeSubView === 'events' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 mb-3 text-sm">Decision Engine Event Stream</h3>
          {events.length === 0 ? (
            <p className="text-slate-500 italic">No events recorded.</p>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-teal-400 font-bold">[{ev.type}]</span>
                  <span className="text-slate-200 font-semibold">{ev.requestId}</span>
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
