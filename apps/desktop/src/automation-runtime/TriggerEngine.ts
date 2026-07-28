import { TriggerConfig, AutomationTriggerType } from './types';

export type TriggerListener = (triggerType: AutomationTriggerType, payload?: Record<string, unknown>) => void;

export class TriggerEngine {
  private static instance: TriggerEngine;
  private listeners = new Set<TriggerListener>();
  private activeTimers = new Map<string, NodeJS.Timeout>();

  public static getInstance(): TriggerEngine {
    if (!TriggerEngine.instance) {
      TriggerEngine.instance = new TriggerEngine();
    }
    return TriggerEngine.instance;
  }

  public subscribe(listener: TriggerListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public emitTrigger(triggerType: AutomationTriggerType, payload?: Record<string, unknown>): void {
    this.listeners.forEach((fn) => fn(triggerType, payload));
  }

  public registerScheduledTrigger(automationId: string, config: TriggerConfig, callback: () => void): void {
    this.clearScheduledTrigger(automationId);

    if (config.type === 'schedule' || config.type === 'cron' || config.type === 'time') {
      // Simulate periodic evaluation every 30 seconds for cron/schedule
      const intervalMs = config.schedulePattern?.includes('interval_')
        ? parseInt(config.schedulePattern.replace('interval_', ''), 10) * 1000
        : 30000;

      const timer = setInterval(() => {
        callback();
      }, intervalMs);

      this.activeTimers.set(automationId, timer);
    }
  }

  public clearScheduledTrigger(automationId: string): void {
    const timer = this.activeTimers.get(automationId);
    if (timer) {
      clearInterval(timer);
      this.activeTimers.delete(automationId);
    }
  }
}
