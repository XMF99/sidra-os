# Sidra OS — Architecture Summary (Epic 30)

## Executive Architecture Overview

Sidra OS is an enterprise-grade, offline-first autonomous operating system for AI orchestration, multi-agent management, organizational planning, execution coordination, and state isolation.

---

## 1. Monorepo Directory Topology

The codebase strictly adheres to the 7-Directory Monorepo Architecture:

```
sidra-os/
├── apps/               # Executable end-user applications & kernel hosts
│   ├── cli/            # Command-line interface shell
│   ├── companion/      # Mobile companion surface
│   ├── desktop/        # 16-Room Tauri + React Developer Console
│   └── kernel-server/  # Standalone headless server binary (M23)
├── services/           # Foundation runtime engines & core domain services
│   ├── agents/         # Agent Runtime & Role Archetype charters
│   ├── artifacts-exec/ # Wasm Executable Artifact execution engine (M20)
│   ├── calibration/    # Measurement & outcome calibration loop (M26)
│   ├── companion/      # Companion backend state & sync handlers
│   ├── compilation/    # Procedural compilation runtime (M28)
│   ├── connectors/     # Connector Runtime, OAuth grants & egress audit (M16/M17)
│   ├── decisions/      # Risk evaluation & decision management engine
│   ├── delegation/     # Multi-seat separation of duties & delegation (M22)
│   ├── departments/    # Enterprise structure & department substrate (M11-M13)
│   ├── evolution/      # Autonomous operations & self-improvement engine (M26-M30)
│   ├── ingest/         # Document ingestion & extraction pipeline
│   ├── kernel/         # Engine lifecycle management & IPC dispatcher
│   ├── memory/         # Hybrid search & token budgeting engine
│   ├── mission/        # Mission Runtime & Directive-to-Mandate planning
│   ├── models/         # Multi-provider LLM gateway & model routing
│   ├── orchestrator/   # Task execution coordinator & agent dispatcher
│   ├── plugins/        # Sandboxed plugin runtime host
│   ├── portability/    # Firm template export & import engine (M25)
│   ├── registry/       # Tool, component, and plugin registry
│   ├── seats/          # Multi-seat identity & boundary management (M21)
│   ├── security/       # PermissionBroker, FenceManager, & KeychainManager
│   ├── self-review/    # Self-review assessment engine (M29)
│   ├── store/          # Single-file SQLite Vault, append-only Event Log, Projections
│   ├── sync/           # Multi-device state synchronization & event merge (M24)
│   ├── tools/          # Tool execution framework & sandbox interfaces
│   └── voice/          # Local on-device speech-to-text directive parser (M19)
├── agents/             # Pre-built agent charters & prompt definitions
├── packages/           # Shared libraries & TypeScript bindings
│   ├── bindings/       # Auto-generated TS types matching Rust structs
│   ├── design/         # Shared design tokens & style variables
│   ├── domain/         # Pure domain entities, directives, mandates, work orders
│   ├── plugin-sdk/     # SDK for Wasm plugin developers
│   ├── testkit/        # Shared mock generators & test harnesses
│   ├── tool-sdk/       # SDK for custom tool authors
│   ├── transport/      # IPC transport abstractions
│   └── ui/             # Reusable UI component library (Rail, Tooltip, etc.)
├── infrastructure/     # Verification gates, CI scripts, & test suites
│   ├── build/          # Build toolchain & packaging scripts
│   ├── ci/             # Automated CI quality gates & scope freeze checks
│   ├── fixtures/       # Test datasets & mock event logs
│   ├── release/        # Release packaging configurations
│   ├── scripts/        # Dependency check, binding drift, SBOM generators
│   └── testing/        # Unit, integration, performance, & certification tests
├── workspace/          # Local developer scratchpad & build caches
└── docs/               # Technical specifications, ADRs, & production guides
```

---

## 2. Structural Layer Hierarchy & Invariants

Sidra OS enforces strict single-direction dependency hierarchy across all layers:

$$\text{packages/domain} \longleftarrow \text{services/*} \longleftarrow \text{apps/*}$$

### Key Architectural Invariants
1. **Domain Model Purity**: `packages/domain` contains zero dependencies on persistence or user interfaces.
2. **Single Choke-Point Security**: All sensitive actions must route through `services/security::PermissionBroker::authorize_action`.
3. **Immutable SHA-256 Event Log**: Every mutation emits an append-only event with SHA-256 hash chaining.
4. **Single-File SQLite Vault Substrate**: All system state is stored in a single embedded SQLite database with embedded refinery migrations (`V1__...sql` through `V38__...sql`).
5. **Rebuildable Projections**: Read models and search indices are projections derived deterministically from the event log.
6. **Air-Gapped Offline-First Execution**: Zero telemetry or cloud dependencies exist (ADR-0009).
