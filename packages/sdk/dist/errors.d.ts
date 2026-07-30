/**
 * SDK Standard Errors
 */
export declare class IPCError extends Error {
    readonly code: string;
    readonly traceId?: string;
    constructor(message: string, code?: string, traceId?: string);
}
export declare class CapabilityDeniedError extends IPCError {
    constructor(resource: string, action: string, traceId?: string);
}
export declare class DomainValidationError extends IPCError {
    constructor(message: string, traceId?: string);
}
//# sourceMappingURL=errors.d.ts.map