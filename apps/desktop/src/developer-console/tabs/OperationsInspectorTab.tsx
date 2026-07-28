import React, { useState } from 'react';
import { AutonomousOperationsEngine } from '../../autonomous-operations/AutonomousOperationsEngine';
import { RecommendationItem } from '../../autonomous-operations/types';

export const OperationsInspectorTab: React.FC = () => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [activeSubView, setActiveSubView] = useState<'scoreboard' | 'recommendations' | 'optimizer' | 'baselines' | 'learning'>('scoreboard');
  const [testOutput, setTestOutput] = useState<string | null>(null);

  // Optimizer Form State
  const [targetRuntimeOpt, setTargetRuntimeOpt] = useState<string>('all');
  const [lastOptResult, setLastOptResult] = useState<{ actionsTaken: string[]; impactSummary: string } | null>(null);

  const engine = AutonomousOperationsEngine.getInstance();
  const { scoreboard, baselines } = engine.analyze();
  const recommendations = engine.getRecommendations();
  const insights = engine.getInsights();
  const metrics = engine.getMetrics();

  const handleApplyRec = (id: string) => {
    try {
      const item = engine.applyRecommendation(id);
      if (item) {
        setTestOutput(`Applied recommendation '${item.title}'. Triggered automated optimization.`);
      }
    } catch (err) {
      setTestOutput(`Apply Error: ${(err as Error).message}`);
    }
  };

  const handleDismissRec = (id: string) => {
    try {
      engine.dismissRecommendation(id);
      setTestOutput(`Dismissed recommendation '${id}'.`);
    } catch (err) {
      setTestOutput(`Dismiss Error: ${(err as Error).message}`);
    }
  };

  const handleExecuteOptimization = () => {
    try {
      const res = engine.optimize(targetRuntimeOpt);
      setLastOptResult(res);
      setTestOutput(res.impactSummary);
    } catch (err) {
      setTestOutput(`Optimization Error: ${(err as Error).message}`);
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    return selectedTypeFilter === 'ALL' || r.type === selectedTypeFilter;
  });

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Header Metrics Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🧠</span>
            <div>
              <h2 className="text-xl font-bold text-teal-400">Sidra Autonomous Operations & Intelligence Engine</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Continuous platform behavior optimization, predictive capacity tuning, and continuous operational learning
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Runtime Score</div>
            <div className="text-sm font-bold text-emerald-400">{metrics.overallRuntimeScore}/100</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Efficiency</div>
            <div className="text-sm font-bold text-teal-300">{metrics.operationalEfficiencyPercent}%</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Improvement</div>
            <div className="text-sm font-bold text-amber-400">+{metrics.improvementPercent}%</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Accuracy</div>
            <div className="text-sm font-bold text-blue-400">{metrics.predictionAccuracyPercent}%</div>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubView('scoreboard')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'scoreboard'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📊 Runtime Scoreboard ({scoreboard.length})
          </button>
          <button
            onClick={() => setActiveSubView('recommendations')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'recommendations'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            💡 Recommendations Queue ({recommendations.filter((r) => r.status === 'pending').length} Pending)
          </button>
          <button
            onClick={() => setActiveSubView('optimizer')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'optimizer'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            ⚡ Optimization Center
          </button>
          <button
            onClick={() => setActiveSubView('baselines')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'baselines'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📈 Baseline Comparison ({baselines.length})
          </button>
          <button
            onClick={() => setActiveSubView('learning')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'learning'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📘 Learning Store ({insights.length})
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

      {/* Scoreboard Subview */}
      {activeSubView === 'scoreboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {scoreboard.map((entry) => (
            <div key={entry.runtimeId} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-100 uppercase">{entry.runtimeId}</h3>
                  <span className="text-[10px] text-slate-400">Risk: {entry.bottleneckRisk}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                  {entry.trend}
                </span>
              </div>

              <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Health Score:</span>
                  <span className="font-bold text-emerald-400">{entry.healthScore}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Efficiency Score:</span>
                  <span className="font-bold text-teal-300">{entry.efficiencyScore}/100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations Subview */}
      {activeSubView === 'recommendations' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-300">Filter Recommendations by Category:</span>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-slate-200 uppercase"
            >
              {['ALL', 'cache', 'retry', 'policy', 'performance', 'resource', 'connector', 'capacity', 'scheduling'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {filteredRecs.map((rec: RecommendationItem) => (
              <div key={rec.id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="font-bold text-sm text-slate-100">{rec.title}</h3>
                      <span className="bg-slate-950 border border-slate-800 text-teal-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {rec.type}
                      </span>
                      <span className="text-[10px] text-slate-400">Target: {rec.targetRuntime}</span>
                    </div>
                    <p className="text-slate-300 text-xs mt-1">{rec.rationale}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${rec.status === 'applied' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                    {rec.status}
                  </span>
                </div>

                {rec.status === 'pending' && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleApplyRec(rec.id)}
                      className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition"
                    >
                      ⚡ Apply Recommendation
                    </button>
                    <button
                      onClick={() => handleDismissRec(rec.id)}
                      className="px-4 py-1.5 bg-slate-950 hover:bg-slate-900 text-slate-400 border border-slate-800 rounded-xl text-xs"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimizer Subview */}
      {activeSubView === 'optimizer' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6 font-mono text-xs">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">⚡ Continuous Platform Optimization Center</h3>
          <div className="space-y-2">
            <label className="text-slate-300">Target Runtime Scope:</label>
            <select
              value={targetRuntimeOpt}
              onChange={(e) => setTargetRuntimeOpt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 font-mono"
            >
              <option value="all">ALL PLATFORM RUNTIMES</option>
              {scoreboard.map((s) => (
                <option key={s.runtimeId} value={s.runtimeId}>
                  {s.runtimeId.toUpperCase()} RUNTIME
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExecuteOptimization}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
          >
            ⚡ Execute Platform Optimization
          </button>

          {lastOptResult && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <span className="font-bold text-teal-300 block">Optimization Execution Summary:</span>
              <p className="text-slate-300">{lastOptResult.impactSummary}</p>
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Actions Taken:</span>
                {lastOptResult.actionsTaken.map((act, i) => (
                  <div key={i} className="text-[11px] text-slate-400">
                    • {act}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Baselines Subview */}
      {activeSubView === 'baselines' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Historical Baseline Comparison</h3>
          <div className="space-y-3">
            {baselines.map((b, i) => (
              <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-100">{b.parameter}</h4>
                  <p className="text-[10px] text-slate-400">Current: {b.currentVal} | Baseline: {b.baselineVal}</p>
                </div>
                <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-xs font-bold font-mono">
                  {b.deltaPercent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Subview */}
      {activeSubView === 'learning' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Continuous Learning Store ({insights.length})</h3>
          <div className="space-y-3">
            {insights.map((l) => (
              <div key={l.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-teal-300">[{l.eventType}]</span>
                  <span className="text-[10px] text-slate-500">Confidence: {l.confidenceScore}%</span>
                </div>
                <p className="text-slate-300 text-xs">{l.lessonLearned}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
