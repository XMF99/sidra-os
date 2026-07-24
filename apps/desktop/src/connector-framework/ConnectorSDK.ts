import { ConnectorManifest, ConnectorState, ConnectorCapability } from './types';

export abstract class BaseConnector {
  public manifest: ConnectorManifest;
  public state: ConnectorState = 'installed';
  public health: 'healthy' | 'degraded' | 'failed' = 'healthy';
  public latencyMs = 12;
  public errorCount = 0;
  public lastCheckedAt = new Date().toISOString();
  public config: Record<string, string> = {};

  constructor(manifest: ConnectorManifest) {
    this.manifest = manifest;
  }

  public async initialize(config: Record<string, string>): Promise<void> {
    this.config = config;
    this.state = 'configured';
  }

  public async connect(): Promise<boolean> {
    this.state = 'connected';
    this.health = 'healthy';
    this.lastCheckedAt = new Date().toISOString();
    return true;
  }

  public async disconnect(): Promise<void> {
    this.state = 'disconnected';
  }

  public async checkHealth(): Promise<'healthy' | 'degraded' | 'failed'> {
    this.lastCheckedAt = new Date().toISOString();
    return this.health;
  }

  public abstract executeCapability(
    capability: ConnectorCapability,
    payload: Record<string, unknown>
  ): Promise<Record<string, unknown>>;
}
