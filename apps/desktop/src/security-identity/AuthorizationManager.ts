import { IdentityRecord, AuthResultState } from './types';

export class AuthorizationManager {
  public static authorize(
    identity: IdentityRecord,
    resource: string,
    action: string
  ): { authorized: boolean; state: AuthResultState; reason: string } {
    if (identity.status === 'locked' || identity.status === 'disabled') {
      return { authorized: false, state: 'locked', reason: `Identity '${identity.name}' is ${identity.status}.` };
    }

    if (identity.roles.includes('administrator') || identity.permissions.includes('*')) {
      return { authorized: true, state: 'authenticated', reason: `Identity '${identity.name}' granted superuser access.` };
    }

    const requiredPerm = `${resource}:${action}`;
    const hasPerm = identity.permissions.some((p) => p === requiredPerm || p === `${resource}:*` || p === '*');

    if (hasPerm) {
      return { authorized: true, state: 'authenticated', reason: `Identity '${identity.name}' has permission '${requiredPerm}'.` };
    }

    return { authorized: false, state: 'denied', reason: `Permission '${requiredPerm}' denied for identity '${identity.name}'.` };
  }
}
