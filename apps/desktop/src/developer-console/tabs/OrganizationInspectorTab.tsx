import React, { useState } from 'react';
import { OrganizationRuntime } from '../../organization-runtime/OrganizationRuntime';

export const OrganizationInspectorTab: React.FC = () => {
  const orgRuntime = OrganizationRuntime.getInstance();
  const entities = orgRuntime.getOrgRegistry().getAll();
  const employees = orgRuntime.getEmployeeRegistry().getByDepartment('dept_eng');

  const [permSubject, setPermSubject] = useState('A-01');
  const [permName, setPermName] = useState('mission.create');
  const [permResult, setPermResult] = useState<boolean | null>(null);

  const handleCheckPermission = () => {
    const allowed = orgRuntime.validatePermission(permSubject, permName);
    setPermResult(allowed);
  };

  return (
    <div className="p-6 space-y-6 text-slate-100">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-teal-400">Organization Inspector</h2>
        <p className="text-sm text-slate-400">Inspect enterprise hierarchy, human & AI memberships, role permissions, policies, and delegations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <h3 className="font-semibold text-slate-200 text-sm">Enterprise Structural Hierarchy ({entities.length})</h3>
          {entities.map((e) => (
            <div key={e.id} className="p-2 bg-slate-950 rounded border border-slate-800 text-xs flex justify-between">
              <span className="font-bold text-teal-300">{e.name}</span>
              <span className="text-slate-400 font-mono">[{e.type}]</span>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
          <h3 className="font-semibold text-slate-200 text-sm">Interactive Permission Engine Tester</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={permSubject}
              onChange={(e) => setPermSubject(e.target.value)}
              placeholder="Subject ID (e.g. A-01)"
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100"
            />
            <input
              type="text"
              value={permName}
              onChange={(e) => setPermName(e.target.value)}
              placeholder="Permission Name"
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100"
            />
            <button
              onClick={handleCheckPermission}
              className="px-3 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded text-xs transition"
            >
              Validate Permission
            </button>
          </div>

          {permResult !== null && (
            <div className={`p-3 rounded border text-xs font-semibold ${permResult ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' : 'bg-rose-950/40 border-rose-500 text-rose-300'}`}>
              Permission Check Result for '{permSubject}' on '{permName}': {permResult ? 'GRANTED (ALLOW)' : 'DENIED (FORBIDDEN)'}
            </div>
          )}

          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Corporate Human Employees</h4>
            {employees.map((emp) => (
              <div key={emp.id} className="text-xs text-slate-400 flex justify-between py-1 border-b border-slate-800/40">
                <span>{emp.name} ({emp.position})</span>
                <span className="text-teal-400">{emp.availability}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
