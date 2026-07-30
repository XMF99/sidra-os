# THEKY Engineering Architecture: Workspace Architecture

**Document ID:** `E01-02`  
**Status:** `IMPLEMENTATION-GRADE`  
**Governing Authority:** `E00 Engineering Constitution`  
**Target Path:** `engineering/E01-engineering-architecture/02-workspace-architecture.md`  

---

## 1. Monorepo Organization & Layout

THEKY monorepo is structured as a dual-runtime workspace supporting both **Rust (Cargo Workspace)** and **TypeScript (pnpm Workspace)**. 

```
sidra-os/
├── apps/                        # Executable application entry points
│   ├── desktop/                 # Tauri desktop host app (Rust src-tauri + React UI)
│   └── web/                     # Web preview / remote dashboard app
├── services/                    # Autonomous application services & engines
│   ├── departments/             # Department business engines & boundary handlers
│   ├── ai-runtime/              # AI agent executor, mission loop & model router
│   └── gateway/                 # Managed HTTP integration gateway
├── packages/                    # Shared libraries & domain models
│   ├── domain/                  # Pure Rust domain logic & state models (No dependencies)
│   ├── vault/                   # Cryptographic storage & hash-chained event store
│   ├── permission-broker/       # Centralized access broker & capability evaluator
│   ├── ui/                      # React UI component library (@theky/ui)
│   └── sdk/                     # TypeScript client SDK for IPC bridge (@theky/sdk)
├── departments/                 # Enterprise Department modules & schemas
├── infrastructure/              # Build scripts, CI quality gates & benchmark suites
│   └── ci/gates/                # CI verification gates (domain_purity_gate.py, etc.)
├── engineering/                 # Architecture documents & constitutional specifications
│   ├── E00-engineering-constitution/
│   └── E01-engineering-architecture/
├── Cargo.toml                   # Root Rust Cargo workspace manifest
├── pnpm-workspace.yaml          # Root TypeScript pnpm workspace manifest
└── Justfile                     # Standardized project command runner
```

---

## 2. Cargo Workspace Architecture (Rust)

The root `Cargo.toml` manages all native crates, ensuring unified dependency versions, shared compilation profiles, and strict isolation.

```toml
[workspace]
resolver = "2"
members = [
    "apps/desktop/src-tauri",
    "services/departments",
    "services/ai-runtime",
    "services/gateway",
    "packages/domain",
    "packages/vault",
    "packages/permission-broker"
]

[workspace.dependencies]
tokio = { version = "1.38", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
sqlite3-sys = "0.15"
rusqlite = { version = "0.31", features = ["bundled"] }
tracing = "0.1"
thiserror = "1.0"
anyhow = "1.0"

[profile.release]
opt-level = 3
lto = "thin"
codegen-units = 1
panic = "abort"
strip = true
```

---

## 3. pnpm Workspace Architecture (TypeScript)

The root `pnpm-workspace.yaml` manages all TypeScript projects and internal packages:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 3.1 Package Mapping & Responsibilities
- `@theky/ui` (`packages/ui`): Reusable React UI design system components, CSS variable tokens, icons, and layout primitives.
- `@theky/sdk` (`packages/sdk`): Typed Tauri IPC bridge, RPC client generator, state hooks, and event subscription bindings.
- `@theky/shared` (`packages/shared`): Common TypeScript utility functions, DTO type definitions, and validation schemas (`zod`).

---

## 4. Dependency Rules & Domain Purity Enforcement

To prevent architectural decay, coupling, and circular dependencies, strict directional rules govern the workspace:

```
[ Presentation (apps/desktop UI) ] ---> [@theky/sdk] ---> [ Tauri IPC Bridge ]
                                                                 |
                                                                 v
                                                     [ Permission Broker ]
                                                                 |
                                                                 v
                                                     [ Services Layer ]
                                                            /         \
                                                           v           v
                                                [ Vault Crate ]   [ Domain Crate ]
                                                                   (PURE RUST - ZERO IO)
```

### 4.1 Dependency Rules
1. **Domain Purity Rule:** The `packages/domain` crate MUST be pure Rust. It cannot depend on `tokio`, `rusqlite`, `tauri`, `serde_json`, or any network/disk IO libraries.
2. **Unidirectional Control Flow:** Higher layers may import lower layers; lower layers MUST NOT import higher layers.
   - `packages/domain` imports nothing within the workspace.
   - `packages/vault` imports `packages/domain`.
   - `services/*` imports `packages/domain` and `packages/vault`.
   - `apps/desktop/src-tauri` imports `services/*`, `permission-broker`, and `vault`.
3. **No Circular References:** Enforced at build time by both `cargo` and `pnpm`.

### 4.2 CI Purity Gates
All commits must pass the **Domain Purity Gate** (`infrastructure/ci/gates/domain_purity_gate.py`), which inspects `packages/domain/Cargo.toml` and AST to verify zero external IO dependencies.

---
