import { AgentMailboxItem } from './types';

export class AgentMailbox {
  private items: AgentMailboxItem[] = [];

  public enqueue(item: AgentMailboxItem): void {
    this.items.push(item);
  }

  public receiveNext(): AgentMailboxItem | undefined {
    const next = this.items.find((item) => item.status === 'queued');
    if (next) {
      next.status = 'processing';
    }
    return next;
  }

  public complete(id: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.status = 'completed';
    }
  }

  public reject(id: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.status = 'rejected';
    }
  }

  public retry(id: string): void {
    const item = this.items.find((i) => i.id === id);
    if (item) {
      item.status = 'queued';
    }
  }

  public getItems(): AgentMailboxItem[] {
    return [...this.items];
  }
}
