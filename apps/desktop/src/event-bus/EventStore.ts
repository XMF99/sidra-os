import { SidraEvent, ReplayRequest } from './types';

export class EventStore {
  private events: SidraEvent[] = [];
  private seenIds = new Set<string>();

  public saveEvent(event: SidraEvent): void {
    if (this.seenIds.has(event.id)) {
      return; // Deduplication
    }
    this.seenIds.add(event.id);
    this.events.unshift(event);
    if (this.events.length > 5000) {
      const removed = this.events.pop();
      if (removed) this.seenIds.delete(removed.id);
    }
  }

  public queryEvents(filter?: {
    topic?: string;
    category?: string;
    correlationId?: string;
    traceId?: string;
    limit?: number;
  }): SidraEvent[] {
    let result = [...this.events];

    if (filter?.topic) {
      result = result.filter((e) => e.topic === filter.topic);
    }
    if (filter?.category) {
      result = result.filter((e) => e.category === filter.category);
    }
    if (filter?.correlationId) {
      result = result.filter((e) => e.correlationId === filter.correlationId);
    }
    if (filter?.traceId) {
      result = result.filter((e) => e.traceId === filter.traceId);
    }

    return result.slice(0, filter?.limit || 100);
  }

  public replayEvents(req: ReplayRequest): SidraEvent[] {
    let matches = [...this.events];

    if (req.topicPattern && req.topicPattern !== '*') {
      matches = matches.filter((e) => e.topic.includes(req.topicPattern!));
    }
    if (req.correlationId) {
      matches = matches.filter((e) => e.correlationId === req.correlationId);
    }
    if (req.startTime) {
      const startMs = new Date(req.startTime).getTime();
      matches = matches.filter((e) => new Date(e.metadata.timestamp).getTime() >= startMs);
    }
    if (req.endTime) {
      const endMs = new Date(req.endTime).getTime();
      matches = matches.filter((e) => new Date(e.metadata.timestamp).getTime() <= endMs);
    }

    return matches.reverse().slice(0, req.limit || 50);
  }

  public archiveEvents(beforeTimestamp: string): number {
    const cutoff = new Date(beforeTimestamp).getTime();
    let archivedCount = 0;

    this.events = this.events.filter((e) => {
      if (new Date(e.metadata.timestamp).getTime() < cutoff) {
        e.state = 'archived';
        archivedCount++;
        return false;
      }
      return true;
    });

    return archivedCount;
  }

  public getAllEvents(): SidraEvent[] {
    return [...this.events];
  }
}
