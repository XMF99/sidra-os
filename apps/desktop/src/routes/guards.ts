export interface GuardResult {
  allowed: boolean;
  reason?: string;
  requiredCapability?: string;
}

export const checkRouteGuard = (
  guardName?: string,
  userCapabilities?: Set<string>
): GuardResult => {
  if (!guardName || guardName === 'authed') {
    return { allowed: true };
  }

  if (guardName === 'dev') {
    return { allowed: process.env.NODE_ENV !== 'production' };
  }

  if (userCapabilities?.has('*') || userCapabilities?.has(guardName)) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `Missing required capability: ${guardName}`,
    requiredCapability: guardName,
  };
};
