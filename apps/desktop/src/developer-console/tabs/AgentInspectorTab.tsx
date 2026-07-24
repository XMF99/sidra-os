import React from 'react';
import { AgentRuntime } from '../../agent-runtime/AgentRuntime';

export const AgentInspectorTab: React.FC = () => {
  const agentRuntime = AgentRuntime.getInstance();
  const agents = agentRuntime.getRegistry().getAll();

  return (
    <div className="p-6 space-y-6 text-slate-100">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-teal-400">Agent Inspector</h2>
        <p className="text-sm text-slate-400">Inspect registered AI agents, lifecycle states, capabilities, health, and heartbeat telemetry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-teal-300">{agent.name}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${agent.state === 'idle' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-amber-950 text-amber-300 border border-amber-500'}`}>
                {agent.state}
              </span>
            </div>
            <div className="text-xs text-slate-400">ID: {agent.id} | Role: {agent.role}</div>
            <div className="text-xs text-slate-400">Dept: {agent.department}</div>
            <div className="flex gap-1 flex-wrap pt-1">
              {agent.capabilities.map((cap) => (
                <span key={cap} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">{cap}</span>
              ))}
            </div>
            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 flex justify-between">
              <span>Health: {agent.health}</span>
              <span>Uptime: {agent.uptimeSeconds}s</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
