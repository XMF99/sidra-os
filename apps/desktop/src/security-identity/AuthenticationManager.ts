import { AuthSessionToken, AuthResultState, IdentityRecord } from './types';

export class AuthenticationManager {
  private tokens = new Map<string, AuthSessionToken>();

  public issueToken(
    identity: IdentityRecord,
    tokenType: AuthSessionToken['tokenType'] = 'session',
    ttlMs = 86400000,
    scope: string[] = ['*']
  ): AuthSessionToken {
    const tokenId = `TOK-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const tokenVal = `sdr_${tokenType}_${Math.random().toString(36).substring(2, 14)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs).toISOString();

    const token: AuthSessionToken = {
      id: tokenId,
      identityId: identity.id,
      tokenType,
      tokenValue: tokenVal,
      state: 'authenticated',
      scope,
      issuedAt: now.toISOString(),
      expiresAt,
    };

    this.tokens.set(tokenId, token);
    return token;
  }

  public validateToken(tokenValOrId: string): { valid: boolean; token?: AuthSessionToken; state: AuthResultState } {
    const token = Array.from(this.tokens.values()).find((t) => t.id === tokenValOrId || t.tokenValue === tokenValOrId);
    if (!token) {
      return { valid: false, state: 'denied' };
    }

    if (token.state === 'revoked') {
      return { valid: false, token, state: 'revoked' };
    }

    if (new Date(token.expiresAt).getTime() < Date.now()) {
      token.state = 'expired';
      return { valid: false, token, state: 'expired' };
    }

    return { valid: true, token, state: 'authenticated' };
  }

  public revokeToken(tokenId: string): void {
    const token = this.tokens.get(tokenId) || Array.from(this.tokens.values()).find((t) => t.tokenValue === tokenId);
    if (token) {
      token.state = 'revoked';
    }
  }

  public getAllActiveTokens(): AuthSessionToken[] {
    const now = Date.now();
    return Array.from(this.tokens.values()).filter((t) => t.state === 'authenticated' && new Date(t.expiresAt).getTime() > now);
  }
}
