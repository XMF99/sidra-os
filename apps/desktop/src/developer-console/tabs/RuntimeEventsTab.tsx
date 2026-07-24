import React, { useEffect, useState } from 'react';
import { ModelGateway } from '../../model-gateway/ModelGateway';
import { AgentRuntime } from '../../agent-runtime/AgentRuntime';
import { WorkflowRuntime } from '../../workflow-runtime/WorkflowRuntime';
import { KnowledgeRuntime } from '../../knowledge-runtime/KnowledgeRuntime';
import { OrganizationRuntime } from '../../organization-runtime/OrganizationRuntime';

export const RuntimeEventsTab: React.FC = () => {
  const [events, setEvents] = useState<Array<{ id: string; type: string; source: string; timestamp: string; payload?: any }>>([]);

  useEffect(() => {
    const gateway = ModelGateway.getInstance();
    const agentRuntime = AgentRuntime.getInstance();
    const wfRuntime = WorkflowRuntime.getInstance();
    const knowledgeRuntime = KnowledgeRuntime.getInstance();
    const orgRuntime = OrganizationRuntime.getInstance();

    const pushEvent = (source: string, ev: any) => {
      setEvents((prev) => [{ id: ev.id, type: ev.type, source, timestamp: ev.timestamp, payload: ev.payload }, ...prev.slice(0, 49)]);
    };

    const unsub1 = gateway.subscribe((ev) => pushEvent('ModelGateway', ev));
    const unsub2 = agentRuntime.subscribe((ev) => pushEvent('AgentRuntime', ev));
    const unsub3 = wfRuntime.subscribe((ev) => pushEvent('WorkflowRuntime', ev));
    const unsub4 = knowledgeRuntime.subscribe((ev) => pushEvent('KnowledgeRuntime', ev));
    const unsub5 = orgRuntime.subscribe((ev) => pushEvent('OrganizationRuntime', ev));

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();
    };
  }, []);

  return (
    <div className="p-6 space-y-6 text-slate-100">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-teal-400">Runtime Telemetry Events</h2>
        <p className="text-sm text-slate-400">Real-time combined event stream aggregated across all 6 Sidra OS runtimes</p>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[400px] space-y-2">
        {events.length === 0 ? (
          <div className="text-xs text-slate-500 italic p-4">No telemetry events logged yet. Trigger an AI or Workflow action to stream live events.</div>
        ) : (
          events.map((ev) => (
            <div key={ev.id} className="p-2.5 bg-slate-900/80 rounded border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 bg-slate-800 text-teal-300 font-bold rounded text-[10px] uppercase">{ev.source}</span>
                <span className="font-semibold text-slate-200">{ev.type}</span>
              </div>
              <span className="text-slate-500 font-mono text-[11px]">{new Date(ev.timestamp).toLocaleTimeString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
