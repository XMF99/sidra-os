import { DeadLetterItem, SidraEvent } from './types';

export class DeadLetterQueue {
  private items: DeadLetterItem[] = [];

  public addDeadLetter(event: SidraEvent, failureReason: string): DeadLetterItem {
    event.state = 'dead_letter';
    const item: DeadLetterItem = {
      id: `DLQ-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      event,
      failureReason,
      failedAt: new Date().toISOString(),
      retryAttempts: event.retryCount,
    };
    this.items.unshift(item);
    if (this.items.length > 500) {
      this.items.pop();
    }
    return item;
  }

  public getDeadLetters(): DeadLetterItem[] {
    return [...this.items];
  }

  public clear(): void {
    this.items = [];
  }
}
