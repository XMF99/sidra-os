# THEKY Engineering Architecture: Frontend Architecture

**Document ID:** `E01-03`  
**Status:** `IMPLEMENTATION-GRADE`  
**Governing Authority:** `E00 Engineering Constitution`  
**Target Path:** `engineering/E01-engineering-architecture/03-frontend-architecture.md`  

---

## 1. Frontend Technology Stack & Principles

The Presentation Layer of THEKY is built as a single-page desktop application hosted within Tauri v2.

- **Framework:** React 18+ (TypeScript, Strict Mode enabled).
- **Build Tooling:** Vite 5.x.
- **Styling:** Vanilla CSS Custom Properties + Utility Classes (CSS Modules/Tailwind base design system). Zero runtime CSS-in-JS libraries to ensure 60 FPS rendering performance.
- **Typography & Aesthetics:** Curated modern typography (Inter / JetBrains Mono), smooth dark-mode palette, glassmorphism UI overlays, micro-animations.

---

## 2. Component Hierarchy & Layout Architecture

The application layout is structured around an Enterprise Shell that dynamically mounts department suites, AI workspace tools, and administrative views:

```
[ RootApp ]
   ├── [ Theme & Global Providers ]
   ├── [ IPC Event Listener Bridge ]
   └── [ AppShell ]
        ├── [ PrimarySidebar ] -> Department Switcher & Quick Navigation
        ├── [ HeaderBar ]       -> Breadcrumbs, Active Department Ceilings, System Status
        ├── [ MainViewport ]    -> Dynamic Router Outlet
        │    ├── [ WorkspaceView ] (AI Agent Workspace, Chat, Mission Execution)
        │    ├── [ DepartmentSuiteView ] (Finance, Operations, Revenue, People, etc.)
        │    └── [ AdminSuiteView ] (Security Settings, Audit Log Viewer, Vault Manager)
        └── [ NotificationCenter ] (Budget-limited notifications <= 5 concurrent alerts)
```

---

## 3. State Management Architecture

State is strictly partitioned into two categories to prevent rendering bloat and data desynchronization:

```
+-----------------------------------------------------------------------------------+
|                                FRONTEND STATE                                     |
+----------------------------------------+------------------------------------------+
| 1. TRANSIENT CLIENT STATE (Zustand)    | 2. PERSISTENT DOMAIN STATE (TanStack Query)|
| - Active Theme & Layout Mode           | - Department Records & Aggregates        |
| - Sidebar Collapsed State              | - Agent Mission Status & Logs            |
| - Active Modal / Form Inputs           | - Event Store Projections Cache          |
| - Real-time AI Stream Buffer           | - Capability Token Cache                 |
+----------------------------------------+------------------------------------------+
```

### 3.1 State Invariants
- **No Direct Mutation:** Client components never mutate domain data locally. All mutations are dispatched as typed IPC Commands to the Rust Core.
- **Event-Driven Cache Invalidation:** The frontend subscribes to real-time events emitted by the Event Sourcing Engine via the IPC Event Bridge. Receipt of a domain event invalidates corresponding TanStack Query keys, triggering automatic read-side synchronization.

---

## 4. Tauri IPC RPC Integration & Typing

IPC calls between React and Rust use a type-safe RPC wrapper generated from Rust DTO definitions:

```typescript
// @theky/sdk IPC Bridge Interface
export interface IPCBridge {
  invoke<TReq, TRes>(cmd: string, payload: TReq): Promise<IPCResult<TRes>>;
  subscribe<TEvent>(event: string, callback: (payload: TEvent) => void): () => void;
}

export type IPCResult<T> = 
  | { success: true; data: T; trace_id: string }
  | { success: false; error: { code: string; message: string }; trace_id: string };

// Strongly-typed command dispatch helper
export async function executeCommand<TReq, TRes>(
  commandName: string, 
  departmentId: string, 
  payload: TReq
): Promise<TRes> {
  const result = await window.__TAURI_INVOKE__<IPCResult<TRes>>("exec_command", {
    request: {
      request_id: crypto.randomUUID(),
      department_id: departmentId,
      command_type: commandName,
      payload
    }
  });

  if (!result.success) {
    throw new Error(`[IPC Error ${result.error.code}]: ${result.error.message}`);
  }
  return result.data;
}
```

---

## 5. Rendering & Performance Optimization

To enforce the **60 FPS & Cold Start ≤ 1.2s** performance budget (ADR-0016):

1. **Virtualization:** All logs, data tables, and event feeds exceeding 50 items MUST use virtualized list rendering (`@tanstack/react-virtual`).
2. **Code Splitting & Lazy Loading:** Department suites are lazily loaded using dynamic imports (`React.lazy`). Initial bundle size for the main shell is capped at **≤ 1.5 MB**.
3. **Concurrent React Reactivity:** Uses `useTransition` and `useDeferredValue` for non-blocking UI rendering during complex AI stream processing.

---
