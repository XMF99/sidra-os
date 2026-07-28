import React, { useState, useEffect } from 'react';
import { PlanningEngine } from '../../planning-engine/PlanningEngine';
import { PlanningEvent, ExecutionPlan } from '../../planning-engine/types';

export const PlanningInspectorTab: React.FC = () => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [events, setEvents] = useState<PlanningEvent[]>([]);
  const [activeSubView, setActiveSubView] = useState<'plans' | 'templates' | 'criticalPath' | 'events'>('plans');
  const [testOutput, setTestOutput] = useState<string | null>(null);

  const engine = PlanningEngine.getInstance();
  const registry = engine.getRegistry();
  const plans = engine.getPlanHistory();
  const templates = registry.getAllTemplates();
  const metrics = engine.getMetrics();

  useEffect(() => {
    setEvents(engine.getEventLog());
    const unsubscribe = engine.subscribe(() => {
      setEvents(engine.getEventLog());
    });
    return () => unsubscribe();
  }, []);

  const handleInstantiateTemplate = (templateId: string) => {
    try {
      const plan = engine.generatePlanFromTemplate(templateId);
      setSelectedPlanId(plan.id);
      setActiveSubView('plans');
      setTestOutput(`Generated Execution Plan '${plan.title}' (${plan.id}) from template.`);
    } catch (err) {
      setTestOutput(`Template Error: ${(err as Error).message}`);
    }
  };

  const handleTriggerReplan = (planId: string) => {
    try {
      const replanned = engine.replan(planId, 'Simulated task failure triggering dynamic re-optimization');
      setSelectedPlanId(replanned.id);
      setTestOutput(`Dynamic Replanning Executed: Plan '${planId}' updated to status REPLANNED (Replan count: ${replanned.replanCount}).`);
    } catch (err) {
      setTestOutput(`Replan Error: ${(err as Error).message}`);
    }
  };

  const filteredPlans = plans.filter((p) => {
    return selectedTypeFilter === 'ALL' || p.planType === selectedTypeFilter;
  });

  const selectedPlan: ExecutionPlan | null = plans.find((p) => p.id === selectedPlanId) || (plans.length > 0 ? plans[0] : null);

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Header Metrics Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📐</span>
            <div>
              <h2 className="text-xl font-bold text-teal-400">Sidra Planning Engine & Critical Path Visualizer</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Strategic planning layer transforming decisions into stages, tasks, dependency graphs, and critical paths
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Total Plans</div>
            <div className="text-sm font-bold text-slate-100">{metrics.totalGeneratedPlans}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Optimization</div>
            <div className="text-sm font-bold text-emerald-400">{metrics.averageOptimizationScore}%</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Avg Critical Path</div>
            <div className="text-sm font-bold text-teal-300">{metrics.averageCriticalPathLength} tasks</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Success Rate</div>
            <div className="text-sm font-bold text-blue-400">{metrics.planSuccessRatePercent}%</div>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubView('plans')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'plans'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📋 Execution Plans ({filteredPlans.length})
          </button>
          <button
            onClick={() => setActiveSubView('templates')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'templates'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📚 Plan Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveSubView('criticalPath')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'criticalPath'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            ⚡ Critical Path Analysis
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

      {/* Templates Subview */}
      {activeSubView === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((tmpl) => (
            <div key={tmpl.id} className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between shadow-lg">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-100 text-sm">{tmpl.name}</h3>
                  <span className="text-[10px] font-mono text-teal-400 uppercase bg-teal-950 border border-teal-800 px-2 py-0.5 rounded-md">
                    {tmpl.planType}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{tmpl.description}</p>
                <div className="text-[10px] font-mono text-slate-500 pt-2">
                  Stages: {tmpl.defaultStages.length} | Milestones: {tmpl.defaultMilestones.length}
                </div>
              </div>

              <button
                onClick={() => handleInstantiateTemplate(tmpl.id)}
                className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
              >
                📋 Instantiate Execution Plan
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Execution Plans Subview */}
      {activeSubView === 'plans' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Plans List */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 max-h-[750px] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 text-sm">Execution Plans</h3>
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-300 font-mono uppercase"
              >
                {['ALL', 'deployment', 'project', 'mission', 'workflow', 'recovery'].map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {filteredPlans.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPlanId(p.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                  selectedPlan?.id === p.id
                    ? 'bg-teal-950/40 border-teal-500 text-teal-200 shadow-teal-500/10'
                    : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/80 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-slate-100">{p.title}</h4>
                    <span className="text-[10px] font-mono text-slate-400">{p.id} • {p.planType}</span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      p.status === 'approved' || p.status === 'executing'
                        ? 'bg-teal-950 text-teal-300 border border-teal-500/50'
                        : p.status === 'replanned'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-1">
                  <span>Opt: <span className="text-teal-400 font-bold">{p.optimizationScore}%</span></span>
                  <span>Est: {p.totalEstimatedHours}h</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Selected Plan Inspector */}
          <div className="lg:col-span-2 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
            {selectedPlan ? (
              <>
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-teal-300">{selectedPlan.title}</h3>
                    <p className="text-xs text-slate-400">{selectedPlan.goal}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTriggerReplan(selectedPlan.id)}
                      className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold hover:bg-amber-500/40"
                    >
                      🔄 Dynamic Replan
                    </button>
                  </div>
                </div>

                {/* Stages & Tasks Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-slate-300 font-mono uppercase">Stages & Assigned Tasks Decomposition</h4>
                  {selectedPlan.stages.map((stg) => (
                    <div key={stg.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                      <h5 className="font-bold text-xs text-teal-300 font-mono">{stg.name}</h5>
                      <div className="space-y-2">
                        {stg.tasks.map((tsk) => {
                          const isCritical = selectedPlan.criticalPathTaskIds.includes(tsk.id);
                          return (
                            <div
                              key={tsk.id}
                              className={`p-3 rounded-lg border font-mono text-xs flex justify-between items-center ${
                                isCritical
                                  ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                                  : 'bg-slate-900 border-slate-800 text-slate-300'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold">{tsk.title}</span>
                                  {isCritical && (
                                    <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-700 px-1.5 py-0.5 rounded uppercase font-bold">
                                      ⚡ Critical Path
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-400">{tsk.description}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] font-bold text-teal-400 uppercase bg-slate-950 border border-slate-800 px-2 py-0.5 rounded">
                                  {tsk.assignedRuntime}
                                </span>
                                <span className="text-[10px] text-slate-500 block mt-0.5">{tsk.estimatedDurationHours}h</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-500 italic">Select an execution plan to inspect stages, tasks, and critical paths.</div>
            )}
          </div>
        </div>
      )}

      {/* Critical Path Subview */}
      {activeSubView === 'criticalPath' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Critical Path Analysis Visualizer</h3>
          {selectedPlan ? (
            <div className="space-y-3">
              <p className="text-slate-400 text-xs">
                Plan <span className="text-teal-300 font-bold">{selectedPlan.title}</span> has {selectedPlan.criticalPathTaskIds.length} tasks on its critical path ({selectedPlan.totalEstimatedHours} hours total duration):
              </p>
              <div className="flex flex-col gap-2">
                {selectedPlan.criticalPathTaskIds.map((taskId, idx) => (
                  <div key={taskId} className="p-3 bg-amber-950/40 border border-amber-500/50 rounded-xl text-amber-200 flex justify-between items-center">
                    <span>Task {idx + 1}: <strong className="text-amber-100">{taskId}</strong></span>
                    <span className="text-[10px] text-amber-400 font-bold uppercase">Critical Chain Node</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-500 italic">Select a plan to view its critical path graph.</p>
          )}
        </div>
      )}

      {/* Event Stream Subview */}
      {activeSubView === 'events' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 mb-3 text-sm">Planning Engine Event Stream</h3>
          {events.length === 0 ? (
            <p className="text-slate-500 italic">No events recorded.</p>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-teal-400 font-bold">[{ev.type}]</span>
                  <span className="text-slate-200 font-semibold">{ev.planId}</span>
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
