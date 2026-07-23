import { AgentCapability } from './types';

export class CapabilityRegistry {
  private static instance: CapabilityRegistry;
  private capabilities = new Set<AgentCapability>();

  private constructor() {
    // Register standard capabilities
    [
      'coding',
      'planning',
      'documentation',
      'research',
      'design',
      'finance',
      'hr',
      'marketing',
      'translation',
      'analysis',
      'search',
      'vision',
      'speech',
    ].forEach((cap) => this.capabilities.add(cap));
  }

  public static getInstance(): CapabilityRegistry {
    if (!CapabilityRegistry.instance) {
      CapabilityRegistry.instance = new CapabilityRegistry();
    }
    return CapabilityRegistry.instance;
  }

  public registerCapability(capability: AgentCapability): void {
    this.capabilities.add(capability);
  }

  public hasCapability(capability: AgentCapability): boolean {
    return this.capabilities.has(capability);
  }

  public getAllCapabilities(): AgentCapability[] {
    return Array.from(this.capabilities.values());
  }
}
