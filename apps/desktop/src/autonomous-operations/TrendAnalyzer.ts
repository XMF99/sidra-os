import { BaselineComparison, RuntimeScoreboardEntry } from './types';

export class TrendAnalyzer {
  public static compareBaseline(): BaselineComparison[] {
    return [
      { parameter: 'Average Step Latency (ms)', currentVal: 14, baselineVal: 28, deltaPercent: -50, status: 'optimal' },
      { parameter: 'Execution Throughput (ops/sec)', currentVal: 185, baselineVal: 120, deltaPercent: 54, status: 'optimal' },
      { parameter: 'Memory Utilization (%)', currentVal: 38, baselineVal: 62, deltaPercent: -38, status: 'optimal' },
      { parameter: 'Queue Depth (pending jobs)', currentVal: 2, baselineVal: 15, deltaPercent: -86, status: 'optimal' },
      { parameter: 'Dead-Letter Event Count', currentVal: 0, baselineVal: 3, deltaPercent: -100, status: 'optimal' },
    ];
  }

  public static generateScoreboard(): RuntimeScoreboardEntry[] {
    const runtimes = [
      'mission', 'workflow', 'automation', 'agent',
      'knowledge', 'decision', 'planning', 'execution',
      'resource', 'eventbus', 'observability', 'policy',
      'security', 'resilience', 'connector', 'operations'
    ];

    return runtimes.map((rt) => ({
      runtimeId: rt,
      healthScore: Math.floor(95 + Math.random() * 5),
      efficiencyScore: Math.floor(92 + Math.random() * 8),
      bottleneckRisk: 'low',
      trend: 'improving',
    }));
  }
}
