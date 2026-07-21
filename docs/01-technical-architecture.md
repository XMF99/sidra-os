# Technical Architecture

## 1. Shape of the system

Sidra OS is a single desktop application with a hard boundary between a **trusted Rust core** and an
**untrusted rendering layer**. Everything valuable — keys, vault, permissions, orchestration, state — lives
in the core. The UI is a view.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  RENDERER  (WebView, untrusted, no secrets, no filesystem, no network)    │
│  React 19 · TypeScript · Vite · Zustand · TanStack Query · Motion         │
│  Design system "Night Atrium" · Radix primitives · virtualized lists      │
└───────────────▲──────────────────────────────────┬───────────────────────┘
                │  typed events (push)             │  typed commands (call)
                │  serde-JSON over Tauri IPC       │  capability-checked
┌───────────────┴──────────────────────────────────▼───────────────────────┐
│  KERNEL  (Rust, trusted)                                                  │
│                                                                            │
│  Command API ── Permission Broker ── Event Bus ── Query API                │
│       │               │                  │            │                    │
│  ┌────▼───────────────▼──────────────────▼────────────▼─────┐             │
│  │ Orchestrator: Engagement · Workflow · Scheduler · Agents  │             │
│  └────┬─────────────┬──────────────┬──────────────┬─────────┘             │
│       │             │              │              │                        │
│  ┌────▼─────┐ ┌─────▼──────┐ ┌─────▼──────┐ ┌────▼───────┐                │
│  │ Memory   │ │ Model      │ │ Tool       │ │ Plugin     │                │
│  │ Service  │ │ Gateway    │ │ Registry   │ │ Host (WASM)│                │
│  └────┬─────┘ └─────┬──────┘ └─────┬──────┘ └────┬───────┘                │
│       │             │              │              │                        │
│  ┌────▼─────────────▼──────────────▼──────────────▼───────┐               │
│  │ Storage: SQLite(SQLCipher) + sqlite-vec + FTS5 + Vault  │               │
│  └──────────────────────────────────────────────────────────┘             │
└────────────────────────────┬──────────────────────────────────────────────┘
                             │ TLS, allowlisted hosts only
                   ┌─────────▼──────────┐
                   │ Model providers    │
                   │ Anthropic / OpenAI │
                   │ local (Ollama) 2.0 │
                   └────────────────────┘
```

## 2. Stack decisions

| Layer | Choice | Why this and not the obvious alternative |
|---|---|---|
| Shell | **Tauri 2** | Electron costs ~150 MB RSS idle and ships a Chromium per app. Tauri uses the OS webview, gives us a Rust core we can reuse verbatim as a server in 3.0, and has a real capability system (ACLs per command) rather than `nodeIntegration: false` as the only lever. Cost: webview inconsistency across platforms — mitigated by a conservative CSS baseline and per-platform visual QA. See ADR-0001. |
| Core language | **Rust** | Long-lived orchestration with concurrency, durable state, and cryptographic auditing. Panics are contained, memory is predictable, and the same crate becomes the 3.0 server binary. |
| Async runtime | **Tokio** (multi-thread) | Agent Turns are I/O-bound on model latency; hundreds of concurrent futures at negligible cost. |
| UI framework | **React 19 + TypeScript (strict)** | Largest pool of high-quality primitives; concurrent rendering matters for streaming token views. |
| Client state | **Zustand** for shell/UI state, **TanStack Query** for kernel-derived data | Two kinds of state with different invalidation semantics should not share one store. |
| Component primitives | **Radix UI** unstyled | Accessibility (focus trap, roving tabindex, ARIA) is expensive to get right; visual identity is ours. |
| Styling | **CSS variables + Tailwind v4 with a token-only preset** | Tokens are the contract; utilities may only reference tokens. Arbitrary values are a lint error. |
| Motion | **Motion (Framer Motion successor)** | Layout animations for panels; springs for glass. Guarded by `prefers-reduced-motion`. |
| Database | **SQLite** via `rusqlite`, encrypted with **SQLCipher** | The Vault must be inspectable in 20 years. One file, transactional, no server. WAL for concurrent reads during writes. |
| Vector search | **sqlite-vec** | Keeps embeddings in the same transactional store as their source rows. No second datastore to keep consistent. Adequate to ~1 M vectors, far beyond year-one need. |
| Lexical search | **SQLite FTS5** (BM25) | Hybrid retrieval needs a real lexical arm; FTS5 is in the same file and transaction. |
| Embeddings | Provider API in 1.0; local `bge-small` via ONNX Runtime in 2.0 | Avoids shipping a model binary in v1; the interface is already abstracted. |
| Plugins | **WebAssembly Component Model** via **Wasmtime** | Deny-by-default sandbox, no ambient authority, cross-language. |
| Serialization | **serde** + JSON Schema for all agent I/O | Every model output is schema-validated before it can affect state. |
| Migrations | `refinery`, forward-only, versioned | See §7. |
| Packaging | Tauri bundler; signed and notarized on macOS, signed MSI on Windows, AppImage + deb on Linux | |
| Updates | Tauri updater, signed manifests, manual-approve by default | Principle 6: no silent change to a trusted system. |

## 3. Process and thread model

One OS process for the app (plus the platform's webview processes) and one Wasmtime process pool for
plugins.

| Executor | Purpose | Concurrency |
|---|---|---|
| `main` | Tauri event loop, window, IPC dispatch | 1 |
| `orchestrator` | Engagement and workflow state machines | 1 logical task per Engagement, cooperative |
| `turn-pool` | Agent Turns (model calls + tool calls) | Bounded semaphore, default 4, configurable 1–12 |
| `io-pool` | Storage, filesystem, ingestion | Tokio blocking pool, 8 |
| `index-pool` | Embedding, chunking, FTS maintenance | 2, lowest priority, always yields to a live Turn |
| `plugin-host` | WASM instances | Separate process, 1 instance per call, hard timeout |

**Backpressure.** The turn-pool semaphore is the single throttle. When saturated, Work Orders queue in
`work_orders(status='queued')` and the UI shows real queue position — never a fake progress bar.

## 4. The renderer boundary

Rules, enforced by Tauri capability ACLs and by review:

1. The renderer has **no** filesystem access, **no** network access, and **no** secrets. All `fs` and `http`
   Tauri plugins are disabled outright.
2. The renderer may call only commands in the generated `commands.ts` binding, which is derived from the
   Rust command registry — the two cannot drift.
3. All command payloads and responses are typed via `ts-rs` generation from Rust types. A type change breaks
   the build, not production.
4. Model output never reaches the DOM as HTML. Markdown is rendered by a sanitizing pipeline with an
   allowlist of nodes; no raw HTML, no scripts, no remote images without an explicit fetch decision.
5. The renderer is treated as compromised in the threat model. Nothing it can call can violate a fence.

## 5. Data flow of one Directive

```
Principal types Directive
  └─► cmd: engagement.create              (renderer → kernel)
      └─► persist directives row + event  (durable BEFORE any model call)
          └─► Orchestrator: new Engagement, state = clarifying
              └─► Turn: agent.exec, purpose = classify+mandate
                  ├─ Memory Service assembles Context Frame (see memory doc §5)
                  ├─ Model Gateway routes → class `reasoner`, budget check
                  └─ output validated against Mandate schema → persist mandate
              └─► emit event: mandate.proposed → renderer renders preview
Principal authorizes
  └─► cmd: mandate.authorize
      └─► Workflow compiled from Mandate staffing plan → steps persisted
          └─► Scheduler dispatches ready steps into turn-pool
              ├─ each Turn: assemble context → model → tools → validate → persist deliverable
              ├─ each tool call: Permission Broker check → allow | deny | approval_request
              └─ events streamed to renderer at every state transition
          └─► Review step (author ≠ reviewer, enforced)
          └─► Turn: agent.exec, purpose = brief
              └─► persist brief → emit brief.ready → notification policy decides interrupt vs batch
```

Every arrow labelled *persist* is a committed SQLite transaction. The invariant is: **no state exists only
in memory**. A `kill -9` at any arrow resumes correctly (see [02-system-design.md](02-system-design.md) §6).

## 6. Module map (Rust workspace)

| Crate | Responsibility | Key public types |
|---|---|---|
| `sidra-kernel` | Command/query API, event bus, lifecycle | `Kernel`, `Command`, `Event` |
| `sidra-domain` | Pure types and invariants, no I/O | `Engagement`, `Mandate`, `WorkOrder`, `Decision` |
| `sidra-store` | SQLite access, migrations, repositories | `Store`, `Repo<T>`, `Tx` |
| `sidra-memory` | Context assembly, retrieval, consolidation | `MemoryService`, `ContextFrame`, `Retriever` |
| `sidra-agents` | Charters, personas, turn execution | `Agent`, `TurnRunner` |
| `sidra-orchestrator` | Engagement + workflow state machines, scheduler | `Orchestrator`, `Workflow`, `Step` |
| `sidra-models` | Provider adapters, routing, budget, streaming | `ModelGateway`, `ModelClass`, `Budget` |
| `sidra-tools` | Tool registry and built-in tools | `Tool`, `ToolCall`, `ToolResult` |
| `sidra-security` | Capabilities, permission broker, audit chain, crypto | `Broker`, `Capability`, `AuditChain` |
| `sidra-plugins` | Wasmtime host, manifest parsing, sandbox | `PluginHost`, `Manifest` |
| `sidra-ingest` | Extraction, chunking, embedding pipeline | `Ingestor`, `Chunker` |
| `sidra-app` | Tauri binding, command registration, window | — |

Dependency rule: `domain` depends on nothing; `store`/`models`/`tools`/`security` depend on `domain`;
`orchestrator` depends on all services; `app` depends on `kernel` only. Cycles are a build failure.

## 7. Configuration and migration

- **Config** is layered: compiled defaults → `vault/config/firm.toml` → per-session overrides. Config is
  data, never code, and is validated on load with actionable errors.
- **Agent definitions** live in `vault/config/agents/*.toml`, versioned and diffable. Changing a charter
  creates a new `agent_version` row so old Turns remain interpretable against the charter they ran under.
- **Migrations** are forward-only, numbered, and transactional. Every release runs `PRAGMA
  integrity_check`, takes an automatic pre-migration snapshot of the DB file, and refuses to open a Vault
  written by a newer schema version.

## 8. Performance strategy

| Concern | Approach |
|---|---|
| Cold start ≤1.2 s | Kernel init is lazy: open DB, restore UI state, render Lobby from a cached Brief; indexes and model clients warm asynchronously |
| Large lists | Virtualized rows (TanStack Virtual); events table paginated by sequence, never `OFFSET` |
| Streaming | Tokens are appended to a ring buffer in the kernel and pushed at ≤30 Hz coalesced, so the renderer never re-renders per token |
| Glass cost | `backdrop-filter` is expensive; it is applied to at most 3 simultaneous surfaces, never inside scrolling content, and disabled on low-power mode |
| Search latency | FTS5 + vec query run concurrently, fused in Rust; a 40 ms debounce on keystroke; results stream in two waves (lexical first, fused second) |
| Index maintenance | Embedding runs on the lowest-priority pool with a yield check against active Turns |

## 9. Failure philosophy

1. **Fail loudly to the log, gracefully to the Principal.** Every error carries a code, a plain-English
   sentence, and a suggested action.
2. **Never lose committed work.** Partial Deliverables are persisted; a crash mid-Turn resumes from the last
   committed step, not the beginning of the Engagement.
3. **Degrade in defined stages:** full → no-network (queue Turns, everything local still works) →
   budget-capped (fast class only) → read-only (vault browsing, search, archive).
4. **A model failure is a normal event, not an exception.** Timeouts, refusals, and schema violations are
   first-class outcomes with retry, reroute, and escalate paths (see routing doc §7).
