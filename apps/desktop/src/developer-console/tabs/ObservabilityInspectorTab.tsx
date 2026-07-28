import React, { useState } from 'react';
import { ObservabilityEngine } from '../../observability/ObservabilityEngine';
import { TraceSpan } from '../../observability/types';

export const ObservabilityInspectorTab: React.FC = () => {
  const [selectedRuntimeFilter, setSelectedRuntimeFilter] = useState<string>('ALL');
  const [traceSearch, setTraceSearch] = useState<string>('tr_sample_trace_101');
  const [activeSubView, setActiveSubView] = useState<'runtimes' | 'metrics' | 'traces' | 'graph' | 'alerts'>('runtimes');
  const [testOutput, setTestOutput] = useState<string | null>(null);

  // Metric Recorder Form State
  const [metricName, setMetricName] = useState<string>('custom_latency_ms');
  const [metricValue, setMetricValue] = useState<number>(24);

  const engine = ObservabilityEngine.getInstance();
  const reports = engine.getAllRuntimeReports();
  const metrics = engine.getMetrics();
  const allMetrics = engine.queryTelemetry({ sourceRuntime: selectedRuntimeFilter === 'ALL' ? undefined : selectedRuntimeFilter });
  const traces = engine.getAllTraces();
  const alerts = engine.getAllAlerts();
  const depGraph = engine.getDependencyGraph();

  const handleRecordTestMetric = () => {
    try {
      engine.recordMetric(metricName, 'histogram', 'dev_console', metricValue, 'ms');
      setTestOutput(`Recorded metric '${metricName}' = ${metricValue} ms.`);
    } catch (err) {
      setTestOutput(`Record Error: ${(err as Error).message}`);
    }
  };

  const searchedSpans: TraceSpan[] = traces.filter((t) => !traceSearch || t.traceId.includes(traceSearch) || t.operationName.toLowerCase().includes(traceSearch.toLowerCase()));

  return (
    <div className="p-6 space-y-6 text-slate-100 font-sans">
      {/* Top Header Metrics Bar */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">👁️</span>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-bold text-teal-400">Sidra Observability & Telemetry Engine</h2>
                <span
                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase ${
                    metrics.overallSystemHealth === 'healthy'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50 animate-pulse'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                  }`}
                >
                  System {metrics.overallSystemHealth}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full-stack observability observing CPU, GPU, memory, distributed traces, 10-runtime health grid, and alerts
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">CPU Load</div>
            <div className="text-sm font-bold text-emerald-400">{metrics.cpuUsagePercent}%</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Memory</div>
            <div className="text-sm font-bold text-teal-300">{metrics.memoryUsagePercent}%</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">GPU Load</div>
            <div className="text-sm font-bold text-amber-400">{metrics.gpuUsagePercent}%</div>
          </div>
          <div className="bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-center">
            <div className="text-slate-500 text-[10px] uppercase">Avg Latency</div>
            <div className="text-sm font-bold text-blue-400">{metrics.averageRuntimeLatencyMs}ms</div>
          </div>
        </div>
      </div>

      {/* Sub-view Navigation Tabs */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubView('runtimes')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'runtimes'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            💚 10-Runtime Health Grid ({reports.length})
          </button>
          <button
            onClick={() => setActiveSubView('metrics')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'metrics'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            📊 Live Metrics ({allMetrics.length})
          </button>
          <button
            onClick={() => setActiveSubView('traces')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'traces'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🔍 Distributed Trace Explorer
          </button>
          <button
            onClick={() => setActiveSubView('graph')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'graph'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            🕸️ Dependency Graph ({depGraph.length})
          </button>
          <button
            onClick={() => setActiveSubView('alerts')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition ${
              activeSubView === 'alerts'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
            }`}
          >
            ⚠️ System Alerts ({alerts.length})
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

      {/* Runtime Health Grid Subview */}
      {activeSubView === 'runtimes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
          {reports.map((rpt) => (
            <div key={rpt.runtimeId} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{rpt.runtimeName}</h3>
                  <span className="text-[10px] text-slate-400">{rpt.runtimeId}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    rpt.status === 'healthy'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/50'
                  }`}
                >
                  {rpt.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center text-[10px]">
                <div>
                  <span className="block text-slate-500">Latency</span>
                  <span className="font-bold text-teal-300">{rpt.latencyMs}ms</span>
                </div>
                <div>
                  <span className="block text-slate-500">Errors</span>
                  <span className="font-bold text-slate-200">{rpt.errorCount}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Uptime</span>
                  <span className="font-bold text-emerald-400">{rpt.uptimePercent}%</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-800">
                <span>Heartbeat:</span>
                <span>{rpt.heartbeatAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Metrics Subview */}
      {activeSubView === 'metrics' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-300">Filter Metrics by Runtime:</span>
            <select
              value={selectedRuntimeFilter}
              onChange={(e) => setSelectedRuntimeFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-slate-200 uppercase"
            >
              <option value="ALL">ALL RUNTIMES</option>
              {reports.map((r) => (
                <option key={r.runtimeId} value={r.runtimeId}>
                  {r.runtimeName}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl max-h-[600px] overflow-y-auto">
            {allMetrics.map((m) => (
              <div key={m.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="font-bold text-teal-300">{m.name}</span>
                  <p className="text-[10px] text-slate-400">Source: {m.sourceRuntime} | Type: {m.metricType}</p>
                </div>
                <span className="font-bold text-amber-400">{m.value} {m.unit}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-slate-200">⚡ Test Metric Recorder</h4>
            <div className="flex gap-4 items-center">
              <input
                type="text"
                value={metricName}
                onChange={(e) => setMetricName(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 font-mono text-xs w-64"
              />
              <input
                type="number"
                value={metricValue}
                onChange={(e) => setMetricValue(parseFloat(e.target.value) || 0)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-100 font-mono text-xs w-28"
              />
              <button
                onClick={handleRecordTestMetric}
                className="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs"
              >
                Record Metric
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Distributed Traces Subview */}
      {activeSubView === 'traces' && (
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-6 font-mono text-xs">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">🔍 Distributed Trace Explorer</h3>
          <div className="flex gap-4 items-center">
            <label className="text-slate-300">Search Trace ID / Operation:</label>
            <input
              type="text"
              value={traceSearch}
              onChange={(e) => setTraceSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono w-80"
            />
          </div>

          <div className="space-y-3">
            {searchedSpans.map((sp) => (
              <div key={sp.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-teal-300">[{sp.sourceRuntime}] {sp.operationName}</span>
                  <span className="text-amber-400 font-bold">{sp.durationMs || 12}ms</span>
                </div>
                <p className="text-[10px] text-slate-400">Span ID: {sp.id} | Trace ID: {sp.traceId} {sp.parentSpanId ? `| Parent: ${sp.parentSpanId}` : ''}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependency Graph Subview */}
      {activeSubView === 'graph' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">🕸️ Sidra OS Runtime Dependency Graph</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {depGraph.map((node) => (
              <div key={node.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-teal-300">{node.label}</span>
                  <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded uppercase">
                    {node.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex flex-wrap gap-1 items-center">
                  <span className="text-slate-500">Dependencies:</span>
                  {node.dependencies.map((dep) => (
                    <span key={dep} className="bg-slate-900 text-slate-300 px-1.5 py-0.5 rounded border border-slate-800">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Subview */}
      {activeSubView === 'alerts' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs shadow-xl">
          <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">System Telemetry Alerts ({alerts.length})</h3>
          {alerts.length === 0 ? (
            <p className="text-slate-500 italic p-4">No active system alerts. All platform runtimes operating within optimal baselines!</p>
          ) : (
            alerts.map((alt) => (
              <div key={alt.id} className="p-4 bg-slate-950 rounded-xl border border-amber-900/50 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-300">[{alt.severity.toUpperCase()}] {alt.ruleName}</span>
                  <span className="text-[10px] text-slate-500">{alt.triggeredAt}</span>
                </div>
                <p className="text-[10px] text-slate-300">{alt.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
