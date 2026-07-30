/**
 * Typed IPC Invocation Engine
 */
declare global {
    interface Window {
        __TAURI_INTERNALS__?: unknown;
        __TAURI_INVOKE__?: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
    }
}
/**
 * Execute a strongly-typed IPC command through Tauri bridge
 */
export declare function executeIPCCommand<TReq, TRes>(commandType: string, departmentId: string, payload: TReq): Promise<TRes>;
//# sourceMappingURL=ipc.d.ts.map