import {
  TelemetryMetric,
  TraceSpan,
  RuntimeHealthReport,
  ObservabilityMetrics,
  ObservabilityEvent,
  SystemHealthState,
  TelemetryAlert,
  DependencyNode,
} from './types';
import { DistributedTracingEngine } from './DistributedTracingEngine';
import { MetricsAggregator } from './MetricsAggregator';
import { HealthAlertEngine } from './HealthAlertEngine';
import { ObservabilityStore } from './ObservabilityStore';

export type ObservabilityEventListener = (event: ObservabilityEvent) => void;

export class ObservabilityEngine {
  private static instance: ObservabilityEngine;
  private tracingEngine = new DistributedTracingEngine();
  private metricsAggregator = new MetricsAggregator();
  private healthAlertEngine = new HealthAlertEngine();
  private store = new ObservabilityStore();
  private listeners = new Set<ObservabilityEventListener>();
  private eventLog: ObservabilityEvent[] = [];

  private constructor() {
    this.seedDefaultTelemetry();
  }

  public static getInstance(): ObservabilityEngine {
    if (!ObservabilityEngine.instance) {
      ObservabilityEngine.instance = new ObservabilityEngine();
    }
    return ObservabilityEngine.instance;
  }

  public subscribe(listener: ObservabilityEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitEvent(type: ObservabilityEvent['type'], sourceRuntime: string, payload?: Record<string, unknown>): void {
    const event: ObservabilityEvent = {
      id: `EV-OBS-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      sourceRuntime,
      timestamp: new Date().toISOString(),
      payload,
    };
    this.eventLog.unshift(event);
    if (this.eventLog.length > 300) {
      this.eventLog.pop();
    }
    this.listeners.forEach((fn) => fn(event));
  }

  public getEventLog(): ObservabilityEvent[] {
    return [...this.eventLog];
  }

  private seedDefaultTelemetry(): void {
    const runtimes = ['mission', 'workflow', 'automation', 'agent', 'knowledge', 'decision', 'planning', 'execution', 'resource', 'eventbus'];

    runtimes.forEach((rt) => {
      this.recordMetric(`${rt}_latency_ms`, 'histogram', rt, Math.floor(12 + Math.random() * 25), 'ms');
      this.recordMetric(`${rt}_throughput_qps`, 'counter', rt, Math.floor(50 + Math.random() * 200), 'ops/s');
    });

    // Seed a sample distributed trace span tree
    const rootSpan = this.tracingEngine.startSpan('OrchestrateMissionExecution', 'mission', 'tr_sample_trace_101');
    const planSpan = this.tracingEngine.startSpan('GenerateExecutionPlan', 'planning', rootSpan.traceId, rootSpan.id);
    this.tracingEngine.endSpan(planSpan.id, 'ok');

    const execSpan = this.tracingEngine.startSpan('DispatchTaskTokens', 'execution', rootSpan.traceId, rootSpan.id);
    const agentSpan = this.tracingEngine.startSpan('AutonomousAgentExecution', 'agent', rootSpan.traceId, execSpan.id);
    this.tracingEngine.endSpan(agentSpan.id, 'ok');
    this.tracingEngine.endSpan(execSpan.id, 'ok');
    this.tracingEngine.endSpan(rootSpan.id, 'ok');
  }

  public recordMetric(
    name: string,
    metricType: TelemetryMetric['metricType'],
    sourceRuntime: string,
    value: number,
    unit = 'ms',
    tags?: Record<string, string>
  ): TelemetryMetric {
    const metric: TelemetryMetric = {
      id: `MTR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      metricType,
      sourceRuntime,
      value,
      unit,
      timestamp: new Date().toISOString(),
      tags,
    };

    this.metricsAggregator.recordMetric(metric);
    this.emitEvent('MetricRecorded', sourceRuntime, { name, value, unit });
    return metric;
  }

  public startTrace(
    operationName: string,
    sourceRuntime: string,
    traceId?: string,
    parentSpanId?: string,
    tags?: Record<string, string>
  ): TraceSpan {
    return this.tracingEngine.startSpan(operationName, sourceRuntime, traceId, parentSpanId, tags);
  }

  public endTrace(spanId: string, status: 'ok' | 'error' = 'ok', errorReason?: string): void {
    this.tracingEngine.endSpan(spanId, status, errorReason);
    this.emitEvent('SpanCompleted', 'tracing', { spanId, status });
  }

  public recordLog(sourceRuntime: string, level: 'info' | 'warn' | 'error', message: string): void {
    if (level === 'error') {
      this.healthAlertEngine.triggerAlert(`Execution Failure in ${sourceRuntime}`, sourceRuntime, message, 'critical');
    }
  }

  public getHealth(): SystemHealthState {
    return this.healthAlertEngine.getOverallHealth();
  }

  public getRuntimeStatus(runtimeId: string): RuntimeHealthReport | undefined {
    return this.healthAlertEngine.getAllReports().find((r) => r.runtimeId === runtimeId);
  }

  public getAllRuntimeReports(): RuntimeHealthReport[] {
    return this.healthAlertEngine.getAllReports();
  }

  public getTrace(traceId: string): TraceSpan[] {
    return this.tracingEngine.getTraceSpans(traceId);
  }

  public getAllTraces(): TraceSpan[] {
    return this.tracingEngine.getAllSpans();
  }

  public getActiveAlerts(): TelemetryAlert[] {
    return this.healthAlertEngine.getActiveAlerts();
  }

  public getAllAlerts(): TelemetryAlert[] {
    return this.healthAlertEngine.getAllAlerts();
  }

  public getDependencyGraph(): DependencyNode[] {
    return this.store.getDependencyGraph();
  }

  public getMetrics(): ObservabilityMetrics {
    return this.metricsAggregator.getSummary(
      this.healthAlertEngine.getActiveAlerts().length,
      this.healthAlertEngine.getOverallHealth()
    );
  }

  public queryTelemetry(filter?: { sourceRuntime?: string; metricName?: string }): TelemetryMetric[] {
    let result = this.metricsAggregator.getAllMetrics();
    if (filter?.sourceRuntime) {
      result = result.filter((m) => m.sourceRuntime === filter.sourceRuntime);
    }
    if (filter?.metricName) {
      result = result.filter((m) => m.name.includes(filter.metricName!));
    }
    return result;
  }
}
