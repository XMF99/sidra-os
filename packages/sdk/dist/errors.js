/**
 * SDK Standard Errors
 */
export class IPCError extends Error {
    code;
    traceId;
    constructor(message, code = "IPC_ERROR", traceId) {
        super(`[${code}] ${message}`);
        this.name = "IPCError";
        this.code = code;
        this.traceId = traceId;
    }
}
export class CapabilityDeniedError extends IPCError {
    constructor(resource, action, traceId) {
        super(`Permission Broker denied capability '${action}' on resource '${resource}'`, "CAPABILITY_DENIED", traceId);
        this.name = "CapabilityDeniedError";
    }
}
export class DomainValidationError extends IPCError {
    constructor(message, traceId) {
        super(message, "DOMAIN_VALIDATION_ERROR", traceId);
        this.name = "DomainValidationError";
    }
}
//# sourceMappingURL=errors.js.map