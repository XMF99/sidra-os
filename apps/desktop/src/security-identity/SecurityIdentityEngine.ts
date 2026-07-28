import {
  IdentityRecord,
  AuthSessionToken,
  AuthResultState,
  SecretItem,
  SecurityMetrics,
  SecurityAuditEvent,
} from './types';
import { SecurityRegistry } from './SecurityRegistry';
import { AuthenticationManager } from './AuthenticationManager';
import { AuthorizationManager } from './AuthorizationManager';
import { CryptoVaultService } from './CryptoVaultService';
import { SecurityMetricsEngine } from './SecurityMetricsEngine';

export class SecurityIdentityEngine {
  private static instance: SecurityIdentityEngine;
  private registry = SecurityRegistry.getInstance();
  private authManager = new AuthenticationManager();
  private cryptoVault = new CryptoVaultService();
  private metricsEngine = new SecurityMetricsEngine();

  private constructor() {
    this.seedDefaultTokens();
  }

  public static getInstance(): SecurityIdentityEngine {
    if (!SecurityIdentityEngine.instance) {
      SecurityIdentityEngine.instance = new SecurityIdentityEngine();
    }
    return SecurityIdentityEngine.instance;
  }

  private seedDefaultTokens(): void {
    const admin = this.registry.getIdentity('usr_admin');
    if (admin) {
      this.authManager.issueToken(admin, 'session', 86400000);
    }
  }

  public authenticate(identityId: string): { success: boolean; token?: AuthSessionToken; state: AuthResultState } {
    const identity = this.registry.getIdentity(identityId) || this.registry.getAllIdentities()[0];
    if (!identity) {
      this.metricsEngine.recordLogin(false);
      return { success: false, state: 'denied' };
    }

    if (identity.status === 'locked' || identity.status === 'disabled') {
      this.metricsEngine.recordLogin(false);
      return { success: false, state: 'locked' };
    }

    const token = this.authManager.issueToken(identity, 'session', 86400000);
    identity.lastLoginAt = new Date().toISOString();
    this.metricsEngine.recordLogin(true);

    this.registry.logAudit({
      id: `AUD-SEC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action: 'authenticate',
      identityId: identity.id,
      state: 'authenticated',
      resource: 'system:auth',
      timestamp: new Date().toISOString(),
    });

    return { success: true, token, state: 'authenticated' };
  }

  public authorize(identityId: string, resource: string, action: string): { authorized: boolean; state: AuthResultState; reason: string } {
    const identity = this.registry.getIdentity(identityId) || this.registry.getAllIdentities()[0];
    if (!identity) {
      this.metricsEngine.recordDenied();
      return { authorized: false, state: 'denied', reason: `Identity '${identityId}' not found.` };
    }

    const res = AuthorizationManager.authorize(identity, resource, action);
    if (!res.authorized) {
      this.metricsEngine.recordDenied();
    }

    this.registry.logAudit({
      id: `AUD-SEC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action: `authorize:${action}`,
      identityId: identity.id,
      state: res.state,
      resource,
      timestamp: new Date().toISOString(),
    });

    return res;
  }

  public issueToken(identityId: string, tokenType: AuthSessionToken['tokenType'] = 'session'): AuthSessionToken {
    const identity = this.registry.getIdentity(identityId) || this.registry.getAllIdentities()[0];
    return this.authManager.issueToken(identity, tokenType);
  }

  public validateToken(tokenVal: string): { valid: boolean; token?: AuthSessionToken; state: AuthResultState } {
    return this.authManager.validateToken(tokenVal);
  }

  public revokeToken(tokenId: string): void {
    this.authManager.revokeToken(tokenId);
  }

  public encrypt(plainText: string): string {
    return this.cryptoVault.encrypt(plainText);
  }

  public decrypt(cipherText: string): string {
    return this.cryptoVault.decrypt(cipherText);
  }

  public sign(data: string): string {
    return this.cryptoVault.sign(data);
  }

  public verify(data: string, signature: string): boolean {
    return this.cryptoVault.verify(data, signature);
  }

  public rotateSecrets(): SecretItem[] {
    const rotated = this.cryptoVault.rotateSecrets();
    this.metricsEngine.recordRotation(rotated.length);
    return rotated;
  }

  public getAllIdentities(): IdentityRecord[] {
    return this.registry.getAllIdentities();
  }

  public getAllSecrets(): SecretItem[] {
    return this.cryptoVault.getAllSecrets();
  }

  public getActiveTokens(): AuthSessionToken[] {
    return this.authManager.getAllActiveTokens();
  }

  public getAuditLog(): SecurityAuditEvent[] {
    return this.registry.getAuditLog();
  }

  public getMetrics(): SecurityMetrics {
    const tokens = this.authManager.getAllActiveTokens();
    return this.metricsEngine.getMetrics(
      tokens.length,
      tokens.length,
      this.registry.getThreatIndicators().length,
      this.registry.getAuditLog().length
    );
  }

  public getRegistry(): SecurityRegistry {
    return this.registry;
  }
}
