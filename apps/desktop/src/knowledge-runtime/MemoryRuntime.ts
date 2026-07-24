import { MemoryItem, MemoryScope } from './types';

export class MemoryRuntime {
  private static instance: MemoryRuntime;
  private memories = new Map<string, MemoryItem>();

  public static getInstance(): MemoryRuntime {
    if (!MemoryRuntime.instance) {
      MemoryRuntime.instance = new MemoryRuntime();
    }
    return MemoryRuntime.instance;
  }

  public store(item: MemoryItem): void {
    this.memories.set(item.id, item);
  }

  public retrieve(key: string, scope?: MemoryScope, ownerId?: string): MemoryItem | undefined {
    for (const mem of this.memories.values()) {
      if (mem.key === key) {
        if (scope && mem.scope !== scope) continue;
        if (ownerId && mem.ownerId !== ownerId) continue;

        if (mem.expiresAt && Date.now() > new Date(mem.expiresAt).getTime()) {
          this.memories.delete(mem.id);
          return undefined;
        }

        return mem;
      }
    }
    return undefined;
  }

  public getByScope(scope: MemoryScope): MemoryItem[] {
    return Array.from(this.memories.values()).filter((m) => m.scope === scope);
  }
}
