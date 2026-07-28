import React, { useState, useEffect } from 'react';
import { WorkflowRuntime } from '../../workflow-runtime/WorkflowRuntime';
import { WorkflowRegistry } from '../../workflow-runtime/WorkflowRegistry';
import { WorkflowEvent } from '../../workflow-runtime/types';

export const WorkflowInspectorTab: React.FC = () => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('wf_procurement');
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState<number>(15000);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [activeTabSubView, setActiveTabSubView] = useState<'templates' | 'instances' | 'events'>('instances');

  const runtime = WorkflowRuntime.getInstance();
  const registry = WorkflowRegistry.getInstance();
  const templates = registry.getAll();
  const instances = runtime.getAllInstances();
  const metrics = runtime.getMetrics();

  useEffect(() => {
    setEvents(runtime.getEventLog());
    const unsubscribe = runtime.subscribe(() => {
      setEvents(runtime.getEventLog());
    });
    return () => unsubscribe();
  }, []);

  const handleStartWorkflow = async (wfId: string) => {
    try {
      setSelectedWorkflowId(wfId);
      const inst = await runtime.startWorkflow(wfId, 'm_executive', { amount: amountInput, requester: 'Eng. Sidra' });
      setSelectedInstanceId(inst.id);
      setActiveTabSubView('instances');
      setTestResult(`Started workflow instance '${inst.id}' (State: ${inst.state})`);
    } catch (err) {
      setTestResult(`Start Error: ${(err as Error).message}`);
    }
  };

  const handleGrantApproval = async (instId: string, nodeId: string) => {
    try {
      const inst = await runtime.grantApproval(instId, nodeId);
      setTestResult(`Granted approval for node '${nodeId}' on instance '${instId}'. State: ${inst.state}`);
    } catch (err) {
      setTestResult(`Approval Error: ${(err as Error).message}`);
    }
  };

  const handleRejectApproval = async (instId: string, nodeId: string) => {
    try {
      await runtime.rejectApproval(instId, nodeId);
      setTestResult(`Rejected approval for node '${nodeId}'. Triggered reverse compensation rollback!`);
    } catch (err) {
      setTestResult(`Rejection Error: ${(err as Error).message}`);
    }
  };

  const handlePause = async (instId: string) => {
    await runtime.pauseWorkflow(instId);
    setTestResult(`Paused workflow instance '${instId}'`);
  };

  const handleResume = async (instId: string) => {
    await runtime.resumeWorkflow(instId);
    setTestResult(`Resumed workflow instance '${instId}'`);
  };

  const handleRunCompensation = async (instId: string) => {
    await runtime.runCompensation(instId);
    setTestResult(`Triggered manual compensation rollback for '${instId}'`);
  };

  const selectedInst = instances.find((i) => i.id === selectedInstanceId) || (instances.length > 0 ? instances[0] : null);
  const selectedDef = selectedInst ? registry.get(selectedInst.workflowId) : registry.get(selectedWorkflowId);

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Header Metrics Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔄</span>
            <div>
              <h2 className="text-xl font-bold text-teal-400">Sidra Workflow Runtime & Manager</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Structured business process orchestrator with human approvals, decision branching, and compensation rollbacks
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Templates</div>
            <div className="text-sm font-bold text-slate-100">{metrics.totalDefinitions}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Active</div>
            <div className="text-sm font-bold text-emerald-400">{metrics.activeInstances}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Approvals</div>
            <div className="text-sm font-bold text-amber-400">{metrics.pendingApprovalsCount}</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Compensations</div>
            <div className="text-sm font-bold text-rose-400">{metrics.compensationsCount}</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-view Tabs */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTabSubView('instances')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTabSubView === 'instances'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📊 Active Instances ({instances.length})
          </button>
          <button
            onClick={() => setActiveTabSubView('templates')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeTabSubView === 'templates'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📚 Workflow Templates ({templates.length})
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
            testResult.includes('Started') || testResult.includes('Granted')
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => setSelectedWorkflowId(tpl.id)}
              className={`p-5 rounded-2xl border space-y-4 flex flex-col justify-between shadow-lg cursor-pointer transition ${
                selectedWorkflowId === tpl.id
                  ? 'bg-slate-900 border-teal-500/80 shadow-teal-500/10'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-100 text-sm">{tpl.name}</h3>
                  <span className="text-[10px] font-mono text-teal-400 bg-teal-950 border border-teal-800 px-2 py-0.5 rounded-md">
                    v{tpl.version}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-3">{tpl.description}</p>
                <div className="text-[10px] font-mono text-slate-500">Nodes: {tpl.nodes.size} steps</div>
              </div>

              {/* Initial Variables Input for Manual Launch */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400">PO Budget Amount ($):</label>
                  <input
                    type="number"
                    value={amountInput}
                    onChange={(e) => setAmountInput(Number(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartWorkflow(tpl.id);
                  }}
                  className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
                >
                  🚀 Instantiate Workflow
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instances Subview */}
      {activeTabSubView === 'instances' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Instances List */}
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3 max-h-[700px] overflow-y-auto">
            <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Active Instances</h3>
            {instances.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">No workflow instances created yet. Launch one from the Templates tab!</div>
            ) : (
              instances.map((inst) => (
                <div
                  key={inst.id}
                  onClick={() => setSelectedInstanceId(inst.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex justify-between items-center ${
                    selectedInstanceId === inst.id
                      ? 'bg-teal-950/40 border-teal-500 text-teal-200'
                      : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-900/80 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">{inst.id}</div>
                    <div className="text-[10px] font-mono text-slate-400">{inst.workflowId} (v{inst.version})</div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      inst.state === 'running'
                        ? 'bg-teal-950 text-teal-300 border border-teal-500/50'
                        : inst.state === 'waiting'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                        : inst.state === 'completed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                        : inst.state === 'compensating' || inst.state === 'failed'
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/50'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {inst.state}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Selected Instance Details & Visual Graph */}
          <div className="lg:col-span-2 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
            {selectedInst ? (
              <>
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-teal-300">{selectedInst.id}</h3>
                    <p className="text-xs text-slate-400">Definition: {selectedInst.workflowId} | Mission: {selectedInst.missionId}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-teal-950 border border-teal-500/50 text-teal-300 font-mono text-xs rounded-lg font-bold uppercase">
                      State: {selectedInst.state}
                    </span>
                  </div>
                </div>

                {/* Pending Human Approvals Panel */}
                {selectedInst.pendingApprovals && selectedInst.pendingApprovals.length > 0 && (
                  <div className="bg-amber-950/40 border border-amber-500/50 p-4 rounded-xl space-y-3">
                    <h4 className="font-bold text-xs text-amber-300 flex items-center gap-2">
                      <span>⚠️</span> Pending Human Approval Required
                    </h4>
                    {selectedInst.pendingApprovals.map((nodeId) => (
                      <div key={nodeId} className="flex justify-between items-center bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                        <div className="text-xs font-mono">
                          <span className="text-slate-200 font-bold">Node: {nodeId}</span>
                          <span className="text-slate-400 block text-[10px]">Role: CFO Executive Signoff</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleGrantApproval(selectedInst.id, nodeId)}
                            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition"
                          >
                            Grant Approval
                          </button>
                          <button
                            onClick={() => handleRejectApproval(selectedInst.id, nodeId)}
                            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 border border-rose-500/40 text-xs rounded-lg font-semibold transition"
                          >
                            Reject & Rollback
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Execution Graph & Nodes View */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-300 uppercase font-mono">Execution Node Graph</h4>
                  <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                    {selectedDef &&
                      Array.from(selectedDef.nodes.values()).map((node) => {
                        const isCurrent = selectedInst.currentNodeId === node.id;
                        const isExecuted = selectedInst.history.some((h) => h.nodeId === node.id);

                        return (
                          <div
                            key={node.id}
                            className={`p-3 rounded-lg border flex justify-between items-center font-mono text-xs ${
                              isCurrent
                                ? 'bg-teal-950/60 border-teal-500 text-teal-200'
                                : isExecuted
                                ? 'bg-slate-900 border-slate-700 text-slate-300'
                                : 'bg-slate-950/40 border-slate-900 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <span className="font-bold">[{node.type.toUpperCase()}]</span>
                              <span>{node.title || node.id}</span>
                              {node.condition && <span className="text-[10px] text-amber-400">({node.condition})</span>}
                            </div>
                            <div className="flex items-center space-x-2">
                              {node.compensationNodeId && <span className="text-[10px] text-rose-400">Rollback: {node.compensationNodeId}</span>}
                              {isCurrent && <span className="px-2 py-0.5 bg-teal-500 text-slate-950 text-[10px] font-bold rounded">ACTIVE</span>}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Variables & Context Inspector */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-300 uppercase font-mono">Variables & Execution Context</h4>
                  <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono text-teal-300 overflow-x-auto">
                    {JSON.stringify(selectedInst.variables, null, 2)}
                  </pre>
                </div>

                {/* Instance Control Buttons */}
                <div className="pt-3 border-t border-slate-800 flex gap-3">
                  {selectedInst.state === 'running' && (
                    <button onClick={() => handlePause(selectedInst.id)} className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold">
                      Pause
                    </button>
                  )}
                  {selectedInst.state === 'paused' && (
                    <button onClick={() => handleResume(selectedInst.id)} className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold">
                      Resume
                    </button>
                  )}
                  <button onClick={() => handleRunCompensation(selectedInst.id)} className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold">
                    Trigger Rollback
                  </button>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-500 italic">Select an active instance to inspect node graphs, variables context, and approval gates.</div>
            )}
          </div>
        </div>
      )}

      {/* Event Stream Subview */}
      {activeTabSubView === 'events' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 mb-3 text-sm">Workflow Event Stream</h3>
          {events.length === 0 ? (
            <p className="text-slate-500 italic">No workflow events recorded.</p>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-teal-400 font-bold">[{ev.type}]</span>
                  <span className="text-slate-200 font-semibold">{ev.workflowInstanceId}</span>
                  {ev.nodeId && <span className="text-amber-300">Node: {ev.nodeId}</span>}
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
