import { TraceSpan } from './types';

export class DistributedTracingEngine {
  private spans = new Map<string, TraceSpan>();

  public startSpan(
    operationName: string,
    sourceRuntime: string,
    traceId?: string,
    parentSpanId?: string,
    tags?: Record<string, string>
  ): TraceSpan {
    const spanId = `SPN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const actualTraceId = traceId || `tr_${Math.random().toString(36).substring(2, 10)}`;

    const span: TraceSpan = {
      id: spanId,
      traceId: actualTraceId,
      parentSpanId,
      operationName,
      sourceRuntime,
      startTimeMs: Date.now(),
      status: 'ok',
      tags,
    };

    this.spans.set(spanId, span);
    return span;
  }

  public endSpan(spanId: string, status: 'ok' | 'error' = 'ok', errorReason?: string): void {
    const span = this.spans.get(spanId);
    if (span) {
      span.endTimeMs = Date.now();
      span.durationMs = span.endTimeMs - span.startTimeMs;
      span.status = status;
      if (errorReason) {
        span.errorReason = errorReason;
      }
    }
  }

  public getTraceSpans(traceId: string): TraceSpan[] {
    return Array.from(this.spans.values()).filter((s) => s.traceId === traceId);
  }

  public getAllSpans(): TraceSpan[] {
    return Array.from(this.spans.values());
  }
}
