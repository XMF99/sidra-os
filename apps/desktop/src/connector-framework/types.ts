export type ConnectorLifecycleState =
  | 'not_installed'
  | 'downloading'
  | 'installing'
  | 'installed'
  | 'detecting'
  | 'detected'
  | 'configuring'
  | 'configured'
  | 'authenticating'
  | 'authenticated'
  | 'connecting'
  | 'connected'
  | 'healthy'
  | 'ready'
  | 'updating'
  | 'disconnected'
  | 'unauthorized'
  | 'rate_limited'
  | 'degraded'
  | 'failed'
  | 'disabled'
  | 'uninstalled';

export type ConnectorState = ConnectorLifecycleState;

export type ConnectorCategory =
  | 'ai'
  | 'gamedev'
  | 'design'
  | 'source_control'
  | 'project_mgmt'
  | 'communication'
  | 'email'
  | 'calendar'
  | 'documents'
  | 'database'
  | 'finance'
  | 'ecommerce'
  | 'marketing'
  | 'crm'
  | 'support'
  | 'hr'
  | 'education'
  | 'data_bi'
  | 'behavior_analytics'
  | 'search'
  | 'automation'
  | 'auth'
  | 'observability';

export type ConnectorCapability =
  | 'read'
  | 'write'
  | 'create'
  | 'update'
  | 'delete'
  | 'upload'
  | 'download'
  | 'search'
  | 'execute'
  | 'stream'
  | 'webhook'
  | 'realtime';

export type AuthType = 'oauth2' | 'api_key' | 'basic' | 'webhook' | 'none';

export interface StateRecord {
  state: ConnectorLifecycleState;
  timestamp: string;
  health: 'healthy' | 'degraded' | 'failed';
  reason?: string;
  recoveryAction?: string;
  lastError?: string;
}

export interface LocalAppInfo {
  name: string;
  installed: boolean;
  version?: string;
  executablePath?: string;
  pluginPath?: string;
  projects?: DiscoveredProject[];
  plugins?: string[];
  status: 'running' | 'idle' | 'not_detected';
}

export interface DiscoveredProject {
  id: string;
  name: string;
  path: string;
  type: string;
  version?: string;
  lastModified?: string;
  metadata?: Record<string, unknown>;
}

export interface ConnectorManifest {
  id: string;
  name: string;
  category: ConnectorCategory;
  version: string;
  description: string;
  developer?: string;
  compatibility?: string;
  authType: AuthType;
  capabilities: ConnectorCapability[];
  permissionsRequired?: string[];
  installationSizeMb?: number;
  icon?: string;
  website?: string;
  defaultConfig?: Record<string, string>;
  supportsLocalAppDetection?: boolean;
  supportsProjectDiscovery?: boolean;
}

export interface ConnectorMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  rateLimitHits: number;
  averageLatencyMs: number;
  lastExecutionTime?: string;
  lastSyncTime?: string;
}

export interface ConnectorInstance {
  manifest: ConnectorManifest;
  state: ConnectorLifecycleState;
  health: 'healthy' | 'degraded' | 'failed';
  latencyMs: number;
  errorCount: number;
  lastCheckedAt: string;
  config: Record<string, string>;
  metrics: ConnectorMetrics;
  history: StateRecord[];
  detectedApp?: LocalAppInfo;
  selectedProject?: DiscoveredProject;
}

export interface ConnectorEvent {
  id: string;
  type:
    | 'ConnectorRegistered'
    | 'StateChanged'
    | 'AppDetected'
    | 'ProjectDiscovered'
    | 'ConnectorConnected'
    | 'ConnectorDisconnected'
    | 'CapabilityExecuted'
    | 'HealthStatusChanged'
    | 'AuthFailed'
    | 'RateLimitExceeded'
    | 'CircuitBreakerOpened'
    | 'CircuitBreakerClosed';
  connectorId: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}

export interface CircuitBreakerState {
  status: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime?: number;
  nextAttemptTime?: number;
}
