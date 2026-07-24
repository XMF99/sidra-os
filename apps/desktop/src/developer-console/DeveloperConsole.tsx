import React, { useState } from 'react';
import { AIPlaygroundTab } from './tabs/AIPlaygroundTab';
import { MissionInspectorTab } from './tabs/MissionInspectorTab';
import { WorkflowInspectorTab } from './tabs/WorkflowInspectorTab';
import { AgentInspectorTab } from './tabs/AgentInspectorTab';
import { KnowledgeInspectorTab } from './tabs/KnowledgeInspectorTab';
import { OrganizationInspectorTab } from './tabs/OrganizationInspectorTab';
import { RuntimeEventsTab } from './tabs/RuntimeEventsTab';
import { DiagnosticsTab } from './tabs/DiagnosticsTab';
import { LogsTab } from './tabs/LogsTab';
import { SettingsTab } from './tabs/SettingsTab';

export type ConsoleTab =
  | 'playground'
  | 'missions'
  | 'workflows'
  | 'agents'
  | 'knowledge'
  | 'organization'
  | 'events'
  | 'diagnostics'
  | 'logs'
  | 'settings';

export const DeveloperConsole: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConsoleTab>('playground');

  const tabs: Array<{ id: ConsoleTab; label: string }> = [
    { id: 'playground', label: 'AI Playground' },
    { id: 'missions', label: 'Mission Inspector' },
    { id: 'workflows', label: 'Workflow Inspector' },
    { id: 'agents', label: 'Agent Inspector' },
    { id: 'knowledge', label: 'Knowledge Inspector' },
    { id: 'organization', label: 'Organization Inspector' },
    { id: 'events', label: 'Runtime Events' },
    { id: 'diagnostics', label: 'Diagnostics' },
    { id: 'logs', label: 'Logs' },
    { id: 'settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xl">🛠️</span>
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-wide">Sidra Developer Console</h1>
            <p className="text-xs text-slate-400">Engineering Runtime Inspector & Debugging Suite</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs text-slate-300 font-mono">Platform Runtimes Operational</span>
        </div>
      </header>

      {/* Navigation Tab Bar */}
      <nav className="flex overflow-x-auto border-b border-slate-800 bg-slate-950/80 px-6 gap-2 pt-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-teal-400 text-teal-300 bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Active Tab Panel */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === 'playground' && <AIPlaygroundTab />}
        {activeTab === 'missions' && <MissionInspectorTab />}
        {activeTab === 'workflows' && <WorkflowInspectorTab />}
        {activeTab === 'agents' && <AgentInspectorTab />}
        {activeTab === 'knowledge' && <KnowledgeInspectorTab />}
        {activeTab === 'organization' && <OrganizationInspectorTab />}
        {activeTab === 'events' && <RuntimeEventsTab />}
        {activeTab === 'diagnostics' && <DiagnosticsTab />}
        {activeTab === 'logs' && <LogsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
    </div>
  );
};
