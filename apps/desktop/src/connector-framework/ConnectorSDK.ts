import {
  ConnectorManifest,
  ConnectorLifecycleState,
  ConnectorCapability,
  StateRecord,
  LocalAppInfo,
  DiscoveredProject,
} from './types';

export abstract class BaseConnector {
  public manifest: ConnectorManifest;
  public state: ConnectorLifecycleState = 'installed';
  public health: 'healthy' | 'degraded' | 'failed' = 'healthy';
  public latencyMs = 12;
  public errorCount = 0;
  public lastCheckedAt = new Date().toISOString();
  public config: Record<string, string> = {};
  public history: StateRecord[] = [];
  public detectedApp?: LocalAppInfo;
  public selectedProject?: DiscoveredProject;

  constructor(manifest: ConnectorManifest) {
    this.manifest = manifest;
    this.transitionState('installed', 'healthy', 'Initialized in registry');
  }

  public transitionState(
    newState: ConnectorLifecycleState,
    health: 'healthy' | 'degraded' | 'failed' = 'healthy',
    reason?: string,
    recoveryAction?: string,
    lastError?: string
  ): void {
    this.state = newState;
    this.health = health;
    this.lastCheckedAt = new Date().toISOString();

    const record: StateRecord = {
      state: newState,
      timestamp: this.lastCheckedAt,
      health,
      reason,
      recoveryAction,
      lastError,
    };

    this.history.unshift(record);
    if (this.history.length > 50) {
      this.history.pop();
    }
  }

  public async initialize(config: Record<string, string>): Promise<void> {
    this.config = config;
    this.transitionState('configured', 'healthy', 'Connector configured with options');
  }

  public async connect(): Promise<boolean> {
    this.transitionState('connecting', 'healthy', 'Initiating connection protocol');
    this.transitionState('connected', 'healthy', 'Successfully connected to service');
    this.transitionState('ready', 'healthy', 'Connector ready for agent capabilities');
    return true;
  }

  public async disconnect(): Promise<void> {
    this.transitionState('disconnected', 'healthy', 'User requested disconnection');
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
