export type IdentityType =
  | 'human_user'
  | 'system_user'
  | 'ai_agent'
  | 'service_account'
  | 'connector_identity'
  | 'runtime_identity'
  | 'developer_identity'
  | 'administrator';

export type AuthResultState =
  | 'authenticated'
  | 'denied'
  | 'expired'
  | 'locked'
  | 'revoked'
  | 'pending';

export interface IdentityRecord {
  id: string;
  name: string;
  identityType: IdentityType;
  roles: string[];
  permissions: string[];
  status: 'active' | 'locked' | 'disabled';
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthSessionToken {
  id: string;
  identityId: string;
  tokenType: 'session' | 'api_key' | 'bearer' | 'service';
  tokenValue: string;
  state: AuthResultState;
  scope: string[];
  issuedAt: string;
  expiresAt: string;
}

export interface SecretItem {
  id: string;
  name: string;
  secretType: 'api_key' | 'private_key' | 'password' | 'certificate';
  encryptedValue: string;
  version: number;
  lastRotatedAt: string;
}

export interface ThreatIndicator {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  sourceIp: string;
  targetIdentityId?: string;
  timestamp: string;
  resolved: boolean;
}

export interface SecurityAuditEvent {
  id: string;
  action: string;
  identityId: string;
  state: AuthResultState;
  resource: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface SecurityMetrics {
  authRequestsPerSec: number;
  authzRequestsPerSec: number;
  successfulLoginsCount: number;
  failedLoginsCount: number;
  deniedRequestsCount: number;
  activeTokenCount: number;
  activeSessionsCount: number;
  secretRotationsCount: number;
  threatAlertsCount: number;
  auditEntriesCount: number;
}
