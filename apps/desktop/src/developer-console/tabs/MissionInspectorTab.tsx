import React, { useState } from 'react';
import { MissionRuntime } from '../../runtime/MissionRuntime';

export const MissionInspectorTab: React.FC = () => {
  const [missionIdInput, setMissionIdInput] = useState('M-101');
  const [log, setLog] = useState<string[]>([]);

  const runtime = MissionRuntime.getInstance();

  const handleStartMission = () => {
    try {
      const mission = runtime.createMission(missionIdInput);
      const record = runtime.startMission(mission.id, 'coding');
      setLog((prev) => [`[${new Date().toLocaleTimeString()}] Started Mission '${record.id}' (${record.state})`, ...prev]);
    } catch (err) {
      setLog((prev) => [`[${new Date().toLocaleTimeString()}] Error: ${(err as Error).message}`, ...prev]);
    }
  };

  return (
    <div className="p-6 space-y-6 text-slate-100">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-teal-400">Mission Inspector</h2>
        <p className="text-sm text-slate-400">Inspect live Mission Runtime execution state, queue, and agent assignments</p>
      </div>

      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex gap-4 items-center">
        <input
          type="text"
          value={missionIdInput}
          onChange={(e) => setMissionIdInput(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
          placeholder="Mission ID"
        />
        <button
          onClick={handleStartMission}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg text-sm transition"
        >
          Initialize & Start Mission
        </button>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 min-h-[250px] space-y-2">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Live Mission Activity Logs</h3>
        {log.map((entry, idx) => (
          <div key={idx} className="font-mono text-xs text-teal-300/90">{entry}</div>
        ))}
      </div>
    </div>
  );
};
