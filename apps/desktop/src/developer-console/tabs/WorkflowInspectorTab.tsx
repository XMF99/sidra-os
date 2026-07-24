import React, { useState } from 'react';
import { WorkflowRuntime } from '../../workflow-runtime/WorkflowRuntime';
import { WorkflowRegistry } from '../../workflow-runtime/WorkflowRegistry';

export const WorkflowInspectorTab: React.FC = () => {
  const [activeInstanceId, setActiveInstanceId] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);

  const wfRuntime = WorkflowRuntime.getInstance();
  const registry = WorkflowRegistry.getInstance();

  const handleStartWorkflow = async () => {
    try {
      const inst = await wfRuntime.startWorkflow('wf_standard_mission', 'M-202', { spendUSD: 150 });
      setActiveInstanceId(inst.id);
      setLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Workflow '${inst.id}' started. State: ${inst.state}. Pending approval: ${inst.pendingApprovals?.join(', ') || 'none'}`,
        ...prev,
      ]);
    } catch (err) {
      setLog((prev) => [`[${new Date().toLocaleTimeString()}] Error: ${(err as Error).message}`, ...prev]);
    }
  };

  const handleApprove = async () => {
    if (!activeInstanceId) return;
    try {
      const inst = await wfRuntime.grantApproval(activeInstanceId, 'approval_principal');
      setLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Granted Approval on '${inst.id}'. Final State: ${inst.state}`,
        ...prev,
      ]);
    } catch (err) {
      setLog((prev) => [`[${new Date().toLocaleTimeString()}] Approval Error: ${(err as Error).message}`, ...prev]);
    }
  };

  return (
    <div className="p-6 space-y-6 text-slate-100">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-teal-400">Workflow Inspector</h2>
        <p className="text-sm text-slate-400">Inspect DAG node execution, state transitions, pending approvals, and compensation rollbacks</p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleStartWorkflow}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg text-sm transition"
        >
          Execute Standard Workflow (DAG)
        </button>
        <button
          onClick={handleApprove}
          disabled={!activeInstanceId}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg text-sm transition disabled:opacity-40"
        >
          Grant Principal Approval Node
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <h3 className="font-semibold text-slate-200 text-sm">Registered DAG Nodes (wf_standard_mission)</h3>
          {Array.from(registry.get('wf_standard_mission')?.nodes.values() || []).map((n) => (
            <div key={n.id} className="p-2 bg-slate-950 rounded border border-slate-800 text-xs flex justify-between">
              <span className="font-bold text-teal-300">{n.id} ({n.type})</span>
              <span className="text-slate-400">{n.title}</span>
            </div>
          ))}
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[250px] space-y-2">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Workflow Execution Trail</h3>
          {log.map((entry, idx) => (
            <div key={idx} className="font-mono text-xs text-amber-300/90">{entry}</div>
          ))}
        </div>
      </div>
    </div>
  );
};
