# THEKY Engineering Architecture: System Architecture

**Document ID:** `E01-01`  
**Status:** `IMPLEMENTATION-GRADE`  
**Governing Authority:** `E00 Engineering Constitution`  
**Target Path:** `engineering/E01-engineering-architecture/01-system-architecture.md`  

---

## 1. Executive Overview & System Purpose

THEKY (Sidra OS) is engineered as an enterprise-grade, local-first AI-native operating system for desktop environments. The system provides high-assurance execution for agentic workflows, deterministic event sourcing, cryptographic data vaulting, and multi-department organization management.

This document defines the physical and logical system architecture, process boundaries, application layers, memory layout principles, and runtime invariants that govern all software execution within the platform.

```
+-----------------------------------------------------------------------------------+
|                                PRESENTATION LAYER                                 |
|               React 18+ Webview (TypeScript, Tailwind, Modern Design)             |
+-----------------------------------------------------------------------------------+
                                         |
                                         | Strongly-Typed IPC RPC Channel (Tauri v2)
                                         v
+-----------------------------------------------------------------------------------+
|                             CORE KERNEL / BOUNDARY LAYER                          |
|                  Tauri Host (Rust Core, Async Tokio Engine)                       |
|  +-----------------------+ +-----------------------+ +-------------------------+  |
|  |   Permission Broker   | |   CQRS Dispatcher     | |   Event Sourcing Engine |  |
|  |  (Single Choke Point) | | (Command/Query Bus)   | |  (Hash-chained SQLite)  |  |
|  +-----------------------+ +-----------------------+ +-------------------------+  |
+-----------------------------------------------------------------------------------+
          |                                  |                           |
          | Local Process IPC                | Database Connections      | IPC / HTTP
          v                                  v                           v
+-----------------------+          +-------------------+     +----------------------+
|   AI RUNTIME ENGINE   |          |  PERSISTENCE &    |     |  EXTERNAL CONNECTORS |
|  (Ollama/llama.cpp/   |          |  SECURITY VAULT   |     |  (Wasm Plugins &     |
|   Cloud AI Providers) |          | (SQLite WAL/Vec)  |     |   Managed HTTP Gate) |
+-----------------------+          +-------------------+     +----------------------+
```

---

## 2. Application Layering Model

The architecture strictly separates concerns across six decoupled application layers:

### 2.1 Layer 0: Presentation Layer (UI Shell)
- **Runtime Environment:** Webview (Chromium/WebKit via Tauri v2).
- **Core Technology:** React 18+, TypeScript 5.x, Modern CSS Variable Token System.
- **Responsibilities:**
  - Rendering responsive UI views for Department Suites, AI Workspace, and Platform Administration.
  - Maintaining transient client state (UI toggles, input drafts, dynamic layout state).
  - Executing zero business logic — acts purely as a command issuer and event observer.
- **Boundaries:** Completely isolated from direct filesystem, raw network sockets, or OS primitives. Interacts with the backend exclusively via Tauri IPC Command invocation and Event listeners.

### 2.2 Layer 1: IPC & RPC Boundary Layer
- **Runtime Environment:** Tauri v2 Native Bridge (Rust).
- **Responsibilities:**
  - Deserializing incoming JSON-RPC payload requests.
  - Enforcing strict request payload schema validation before processing.
  - Translating client commands into internal Application Service execution contexts.
  - Streaming push notifications and real-time event updates back to the Presentation Layer.

### 2.3 Layer 2: Core Kernel Layer
- **Runtime Environment:** Native Rust Async Execution Engine (`tokio`).
- **Responsibilities:**
  - Orchestrating task execution, event sourcing, and memory management.
  - Hosting the **Permission Broker** — the single choke point for all capability evaluations.
  - Managing process lifecycle, department boundaries, sub-budget allocations, and thread pools.
- **Boundaries:** Zero presentation or UI code; zero raw SQL queries (delegates to Domain/Persistence repositories).

### 2.4 Layer 3: Domain & Application Services Layer
- **Runtime Environment:** Pure Rust Crates (`packages/domain`, `services/*`).
- **Responsibilities:**
  - Encapsulating pure business rules, department invariants, state transition rules, and domain models.
  - Implementing Command Handlers (mutations) and Query Handlers (read models).
  - Maintaining absolute framework purity (zero dependencies on Tauri, Webview, or specific IO backends).

### 2.5 Layer 4: Persistence & Vault Layer
- **Runtime Environment:** Embedded SQLite engine running in Write-Ahead Logging (WAL) mode + `sqlite-vec`.
- **Responsibilities:**
  - Managing the **Hash-Chained Append-Only Event Store** (source of truth).
  - Providing transactional projection updates into domain query tables.
  - Executing Zero-Knowledge cryptographic key derivation (Argon2id) and AES-256-GCM vault encryption for sensitive fields and secrets.

### 2.6 Layer 5: AI Engine & External Integration Layer
- **Runtime Environment:** Isolated Sidecar Process (local LLM runtime) & Rust async HTTP client manager.
- **Responsibilities:**
  - Managing local AI inference context, token streaming, and model routing.
  - Facilitating 3rd party integration via sandboxed WebAssembly (Wasm) connectors.

---

## 3. Runtime Boundaries & Process Topology

To guarantee system stability, memory safety, and security isolation, THEKY isolates components across distinct OS processes:

```
+---------------------------------------------------------------------------------+
| OS PROCESS 1: MAIN TAURI HOST PROCESS (Rust)                                    |
| - Async Tokio Runtime (Multi-threaded worker pool: N core threads)               |
| - Core Kernel & Security Permission Broker                                      |
| - SQLite Database Master Connection Pool                                        |
+---------------------------------------------------------------------------------+
          |                                      |
          | OS IPC (Webview Bridge)              | OS Process Pipe (stdin/stdout)
          v                                      v
+-----------------------------------+  +------------------------------------------+
| OS PROCESS 2: RENDER PROCESS      |  | OS PROCESS 3: AI SIDECAR PROCESS         |
| - React Webview JS Engine         |  | - llama.cpp / Ollama Engine              |
| - Hardware-accelerated GPU Canvas |  | - Dedicated CPU/GPU VRAM allocation      |
| - Memory Capped: ≤400MB Idle      |  | - Process priority: Below Normal         |
+-----------------------------------+  +------------------------------------------+
```

### 3.1 Process Isolation Rules
1. **Main Process (Tauri Host):**
   - Single instance. Holds privileged OS capabilities (file handle access, vault encryption keys in memory, network sockets).
   - Runs with standard user-level permissions (never elevated/root).
2. **Webview Process (Render):**
   - Strictly sandboxed. Disables all node integration and direct file protocol access (`file://` restricted).
   - Content Security Policy (CSP) restricts dynamic script evaluation and unauthorized remote endpoint calls.
3. **AI Sidecar Process:**
   - Spawns as a low-priority child process.
   - Communicates with the Main Process strictly through standard I/O (stdin/stdout IPC) or local loopback TCP (restricted to `127.0.0.1:<random-port>`).

---

## 4. Communication Architecture & IPC Flow

All cross-boundary interactions follow a strict Request/Response (Command Query Responsibility Segregation) or Pub/Sub pattern:

```
Webview (React)                Tauri Bridge               Permission Broker           Domain Handler             Event Store
   |                                 |                            |                         |                         |
   |--- 1. invoke("exec_cmd") ------>|                            |                         |                         |
   |                                 |--- 2. Evaluate Capability->|                         |                         |
   |                                 |<-- 3. Capability Granted --|                         |                         |
   |                                 |                                                      |                         |
   |                                 |------------------- 4. Execute Command -------------->|                         |
   |                                 |                                                      |--- 5. Append Event ---->|
   |                                 |                                                      |<-- 6. Event Hash -----|
   |                                 |<------------------ 7. Return Result -----------------|                         |
   |<-- 8. IPC Reply ----------------|                                                                                |
```

### 4.1 IPC Command Specification Contract
- Every IPC command payload must include:
  1. `request_id`: UUIDv4 string for request tracing.
  2. `department_id`: Scoped departmental execution context.
  3. `command_type`: Fully qualified name string (e.g., `departments.finance.approve_invoice`).
  4. `payload`: JSON object matching domain command DTO.
- Every response must return a standardized wrapper:
  ```typescript
  type IPCResult<T> = 
    | { success: true; data: T; trace_id: string }
    | { success: false; error: { code: string; message: string; details?: unknown }; trace_id: string };
  ```

---

## 5. Architectural Invariants & Non-Negotiables

All engineers and automated implementation phases must adhere strictly to these core system invariants:

1. **Log as Truth (ADR-0002):** The hash-chained append-only event log is the sole source of truth. Read-side tables are disposable projections.
2. **Permission Broker Choke Point (ADR-0006):** No component checks its own permissions. All access requests pass through the centralized Permission Broker.
3. **Default Deny:** Capabilities must be explicitly requested and granted. Zero ambient authority exists.
4. **Departmental Boundary Isolation (ADR-0013):** Departments possess separate memory namespaces, capability ceilings, sub-budgets, and filesystem scopes. Cross-department calls execute strictly via contract interfaces.
5. **No Kernel Custom Logic:** The Core Kernel contains zero department-specific code or conditional logic (`if department == ...` is forbidden).
6. **Performance Budgets:** Cold start ≤ 1.2s, 60 FPS UI rendering, idle RAM consumption ≤ 400MB.

---
