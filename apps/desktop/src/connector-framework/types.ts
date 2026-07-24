export type ConnectorState =
  | 'installed'
  | 'configured'
  | 'connected'
  | 'disconnected'
  | 'unauthorized'
  | 'rate_limited'
  | 'healthy'
  | 'degraded'
  | 'failed'
  | 'disabled';

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

export interface ConnectorManifest {
  id: string;
  name: string;
  category: ConnectorCategory;
  version: string;
  description: string;
  authType: AuthType;
  capabilities: ConnectorCapability[];
  icon?: string;
  website?: string;
}

export interface ConnectorInstance {
  manifest: ConnectorManifest;
  state: ConnectorState;
  health: 'healthy' | 'degraded' | 'failed';
  latencyMs: number;
  errorCount: number;
  lastCheckedAt: string;
  config: Record<string, string>;
}

export interface ConnectorEvent {
  id: string;
  type:
    | 'ConnectorRegistered'
    | 'ConnectorConnected'
    | 'ConnectorDisconnected'
    | 'CapabilityExecuted'
    | 'HealthStatusChanged'
    | 'AuthFailed';
  connectorId: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}
