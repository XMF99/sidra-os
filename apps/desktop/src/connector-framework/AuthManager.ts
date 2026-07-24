import { AuthType } from './types';

export class AuthManager {
  private static instance: AuthManager;
  private tokens = new Map<string, string>();

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  public storeCredential(connectorId: string, credential: string): void {
    this.tokens.set(connectorId, credential);
  }

  public getCredential(connectorId: string): string | undefined {
    return this.tokens.get(connectorId);
  }

  public validateAuth(connectorId: string, authType: AuthType): boolean {
    if (authType === 'none') return true;
    const cred = this.tokens.get(connectorId);
    return Boolean(cred && cred.length > 0);
  }
}
