import React, { useState, useEffect } from 'react';
import { ResourceManagementEngine } from '../../resource-management/ResourceManagementEngine';
import { ResourceEvent, ResourcePool } from '../../resource-management/types';

export const ResourceInspectorTab: React.FC = () => {
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [events, setEvents] = useState<ResourceEvent[]>([]);
  const [activeSubView, setActiveSubView] = useState<'pools' | 'leases' | 'forecast' | 'tester' | 'events'>('pools');
  const [testOutput, setTestOutput] = useState<string | null>(null);

  // Allocation Tester State
  const [targetPoolId, setTargetPoolId] = useState<string>('pool_cpu');
  const [allocUnits, setAllocUnits] = useState<number>(4);

  const engine = ResourceManagementEngine.getInstance();
  const registry = engine.getRegistry();
  const pools = registry.getAllPools();
  const metrics = engine.getMetrics();
  const leases = engine.getAllLeases();
  const forecasts = engine.forecast();

  useEffect(() => {
    setEvents(engine.getEventLog());
    const unsubscribe = engine.subscribe(() => {
      setEvents(engine.getEventLog());
    });
    return () => unsubscribe();
  }, []);

  const handleAllocateTest = () => {
    try {
      const res = engine.allocate(targetPoolId, allocUnits, 'DevConsoleTester', 'execution_coordinator');
      setTestOutput(`Allocated ${res.token.allocatedUnits} units from pool '${res.token.poolId}'. Lease ID: '${res.lease.id}' (Expires: ${res.lease.expiresAt}).`);
    } catch (err) {
      setTestOutput(`Allocation Error: ${(err as Error).message}`);
    }
  };

  const handleRenewLease = (leaseId: string) => {
    try {
      const renewed = engine.renewLease(leaseId, 30000);
      setTestOutput(`Lease '${leaseId}' renewed for 30s. New expiration: ${renewed.expiresAt}`);
    } catch (err) {
      setTestOutput(`Renewal Error: ${(err as Error).message}`);
    }
  };

  const filteredPools = pools.filter((p) => {
    return selectedTypeFilter === 'ALL' || p.resourceType === selectedTypeFilter;
  });

  const selectedPool: ResourcePool | null = pools.find((p) => p.id === selectedPoolId) || (pools.length > 0 ? pools[0] : null);

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Header Metrics Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🔋</span>
            <div>
              <h2 className="text-xl font-bold text-teal-400">Sidra Resource & Capacity Management Engine</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                System resource manager controlling CPU, GPU, memory, model slots, AI worker capacity, and lease locks
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Utilization</div>
            <div className="text-sm font-bold text-emerald-400">{metrics.overallUtilizationPercent}%</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Idle Cap</div>
            <div className="text-sm font-bold text-teal-300">{metrics.idleCapacityPercent}%</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Peak Usage</div>
            <div className="text-sm font-bold text-amber-400">{metrics.peakUsageUnits} u</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Balance Score</div>
            <div className="text-sm font-bold text-blue-400">{metrics.poolBalanceScorePercent}%</div>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubView('pools')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'pools'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📋 Resource Pools ({filteredPools.length})
          </button>
          <button
            onClick={() => setActiveSubView('leases')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'leases'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🔑 Active Leases ({leases.length})
          </button>
          <button
            onClick={() => setActiveSubView('forecast')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'forecast'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📊 Capacity Forecasting
          </button>
          <button
            onClick={() => setActiveSubView('tester')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'tester'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            ⚡ Allocation Tester
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

      {/* Pools Subview */}
      {activeSubView === 'pools' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-xs font-mono text-slate-300">Filter Pools by Resource Type:</span>
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs font-mono text-slate-200 uppercase"
            >
              {['ALL', 'cpu', 'gpu', 'memory', 'ai_agent', 'model', 'connector', 'workflow_slot', 'automation_worker'].map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPools.map((p) => {
              const utilPct = Math.round(((p.allocatedCapacity + p.reservedCapacity) / Math.max(1, p.totalCapacity)) * 100);
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPoolId(p.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition space-y-4 shadow-lg ${
                    selectedPool?.id === p.id
                      ? 'bg-teal-950/40 border-teal-500 text-teal-200 shadow-teal-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">{p.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400">{p.id} • {p.resourceType}</span>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        p.status === 'healthy'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                          : p.status === 'constrained'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/50'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Capacity Utilization</span>
                      <span className="text-teal-300 font-bold">{utilPct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div className="bg-teal-400 h-full rounded-full transition-all" style={{ width: `${utilPct}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-slate-400 pt-1 text-center bg-slate-950/50 p-2 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="block text-slate-500">Allocated</span>
                      <span className="font-bold text-slate-200">{p.allocatedCapacity} {p.unit}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Reserved</span>
                      <span className="font-bold text-amber-300">{p.reservedCapacity} {p.unit}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Available</span>
                      <span className="font-bold text-emerald-300">{p.availableCapacity} {p.unit}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leases Subview */}
      {activeSubView === 'leases' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">Active Reservation Leases & Locks ({leases.length})</h3>
          {leases.length === 0 ? (
            <p className="text-slate-500 italic p-4">No active resource leases. Allocate resources in the tester tab!</p>
          ) : (
            <div className="space-y-3">
              {leases.map((lse) => (
                <div key={lse.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-teal-300">{lse.id}</span>
                      <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        Pool: {lse.poolId}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Units: {lse.allocatedUnits} | Renewed: {lse.renewedCount} times | Expires At: {lse.expiresAt}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRenewLease(lse.id)}
                    className="px-3 py-1.5 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-lg text-xs font-bold hover:bg-teal-500/40"
                  >
                    🔄 Renew Lease (30s)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Forecast Subview */}
      {activeSubView === 'forecast' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {forecasts.map((fc, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">{fc.poolName}</h4>
                  <span className="text-[10px] text-slate-400">{fc.resourceType}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${fc.status === 'healthy' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                  {fc.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 block">Current Util</span>
                  <span className="text-sm font-bold text-teal-300">{fc.currentUtilizationPercent}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Forecasted Peak</span>
                  <span className="text-sm font-bold text-amber-400">{fc.forecastedUtilizationPercent}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tester Subview */}
      {activeSubView === 'tester' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">⚡ Interactive Resource Allocation Tester</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300">Select Resource Pool:</label>
              <select
                value={targetPoolId}
                onChange={(e) => setTargetPoolId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-100"
              >
                {pools.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.availableCapacity} {p.unit} available)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300">Requested Units:</label>
              <input
                type="number"
                min={1}
                max={20}
                value={allocUnits}
                onChange={(e) => setAllocUnits(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-100"
              />
            </div>
          </div>

          <button
            onClick={handleAllocateTest}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-md shadow-teal-500/20"
          >
            ⚡ Allocate Resource Units
          </button>
        </div>
      )}

      {/* Event Stream Subview */}
      {activeSubView === 'events' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 mb-3 text-sm">Resource Engine Event Stream</h3>
          {events.length === 0 ? (
            <p className="text-slate-500 italic">No events recorded.</p>
          ) : (
            events.map((ev) => (
              <div key={ev.id} className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <span className="text-teal-400 font-bold">[{ev.type}]</span>
                  <span className="text-slate-200 font-semibold">{ev.poolId}</span>
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
