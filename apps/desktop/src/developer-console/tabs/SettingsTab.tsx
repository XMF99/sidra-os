import React, { useState } from 'react';

export const SettingsTab: React.FC = () => {
  const [devMode, setDevMode] = useState(true);
  const [defaultModel, setDefaultModel] = useState('anthropic/claude-3.5-sonnet');

  return (
    <div className="p-6 space-y-6 text-slate-100 max-w-2xl">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-teal-400">Console Settings</h2>
        <p className="text-sm text-slate-400">Configure developer mode, default AI provider model, and debug parameters</p>
      </div>

      <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-200 text-sm">Developer Mode</div>
            <div className="text-xs text-slate-400">Enable verbose telemetry logging and runtime inspection panels</div>
          </div>
          <input
            type="checkbox"
            checked={devMode}
            onChange={(e) => setDevMode(e.target.checked)}
            className="accent-teal-400 w-4 h-4"
          />
        </div>

        <div className="pt-3 border-t border-slate-800 space-y-1">
          <label className="text-xs text-slate-400 block">Default OpenRouter AI Model</label>
          <input
            type="text"
            value={defaultModel}
            onChange={(e) => setDefaultModel(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>
    </div>
  );
};
