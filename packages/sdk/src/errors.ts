/**
 * SDK Standard Errors
 */

export class IPCError extends Error {
  public readonly code: string;
  public readonly traceId?: string;

  constructor(message: string, code = "IPC_ERROR", traceId?: string) {
    super(`[${code}] ${message}`);
    this.name = "IPCError";
    this.code = code;
    this.traceId = traceId;
  }
}

export class CapabilityDeniedError extends IPCError {
  constructor(resource: string, action: string, traceId?: string) {
    super(
      `Permission Broker denied capability '${action}' on resource '${resource}'`,
      "CAPABILITY_DENIED",
      traceId
    );
    this.name = "CapabilityDeniedError";
  }
}

export class DomainValidationError extends IPCError {
  constructor(message: string, traceId?: string) {
    super(message, "DOMAIN_VALIDATION_ERROR", traceId);
    this.name = "DomainValidationError";
  }
}
