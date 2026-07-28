import { Automation } from './types';
import { TriggerEngine } from './TriggerEngine';

export class AutomationScheduler {
  private static instance: AutomationScheduler;
  private triggerEngine = TriggerEngine.getInstance();

  public static getInstance(): AutomationScheduler {
    if (!AutomationScheduler.instance) {
      AutomationScheduler.instance = new AutomationScheduler();
    }
    return AutomationScheduler.instance;
  }

  public scheduleAutomation(automation: Automation, onTrigger: () => void): void {
    if (!automation.enabled) {
      this.triggerEngine.clearScheduledTrigger(automation.id);
      return;
    }

    this.triggerEngine.registerScheduledTrigger(automation.id, automation.trigger, () => {
      onTrigger();
    });
  }

  public cancelScheduledAutomation(automationId: string): void {
    this.triggerEngine.clearScheduledTrigger(automationId);
  }
}
