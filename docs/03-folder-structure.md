# Folder Structure

Two trees: the **repository** (what engineers work in) and the **Vault** (what the Principal owns).

## 1. Repository

Seven top-level directories. The split is by **what a thing is for**, not by what language it is written in —
so a Rust crate and its TypeScript bindings can live together when they are one product surface, and a
capability that will become a network service in 3.0 already sits where a service sits.

```
SidraOS/
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── Cargo.toml                       # Rust workspace: members = apps/*, services/*, packages/*
├── pnpm-workspace.yaml              # JS workspace: apps/*, packages/*
├── rust-toolchain.toml
├── Justfile                         # one entry point per task: build, test, eval, chaos, release
│
├── docs/                            # this document set, versioned with the code
├── apps/                            # things a person launches
├── services/                        # the kernel's capabilities, one crate each
├── agents/                          # the Firm as data: charters, playbooks, evaluations
├── packages/                        # shared libraries, consumed by apps and services
├── infrastructure/                  # how it is built, signed, shipped and proven
└── workspace/                       # local runtime scratch — never committed
```

### 1.1 `apps/` — things a person launches

```
apps/
├── desktop/                         # Sidra OS 1.0, the only shipping app
│   ├── src-tauri/
│   │   ├── Cargo.toml               # crate: sidra-app
│   │   ├── tauri.conf.json
│   │   ├── capabilities/            # Tauri ACLs — the renderer's permission surface
│   │   └── src/{main,ipc,windows,tray,updater}.rs
│   └── src/                         # renderer (React 19, TypeScript strict)
│       ├── main.tsx
│       ├── app/                     # shell, routing, providers, error boundaries
│       ├── rooms/                   # Lobby, Boardroom, Department, Archive, Vault, Console, Settings
│       ├── features/                # directive, engagement, meeting, decision, memory, budget
│       ├── state/                   # zustand stores + TanStack query keys
│       └── lib/                     # hotkeys, markdown, formatters, virtualization
│
├── companion/                       # 2.0 — placeholder, README only in 1.0
└── cli/                             # sidractl: vault verify, export, migrate, doctor
```

`cli/` exists in 1.0 and is not a convenience. Vault verification, export, and migration rehearsal must be
runnable without a GUI, because the situations that need them are the situations where the GUI will not open.

### 1.2 `services/` — the kernel's capabilities

One crate per capability. Each has a trait-shaped public interface, no dependency on Tauri, and no knowledge
of which process it runs in — which is the property that lets ADR-0005's routing, the 3.0 hosted deployment,
and the CLI all reuse them unchanged.

```
services/
├── kernel/          # sidra-kernel        — command/query API, event bus, lifecycle, recovery
├── store/           # sidra-store         — SQLite, migrations/, repositories, FTS, vectors
├── security/        # sidra-security      — broker, capability, fence, audit chain, crypto, keychain
├── memory/          # sidra-memory        — frame, retriever, consolidator, canon, chunker
├── models/          # sidra-models        — gateway, router, budget, stream, providers/
├── orchestrator/    # sidra-orchestrator  — engagement, workflow, scheduler, meeting, decision, automation, notify
├── agents/          # sidra-agents        — charter loading, turn runner, persona, validator
├── tools/           # sidra-tools         — registry + builtin/{fs,web,search,artifact,calc}
├── ingest/          # sidra-ingest        — extract/{pdf,docx,xlsx,html,image}, chunk, embed
└── plugins/         # sidra-plugins       — Wasmtime host, manifest, sandbox, WIT bindings
```

`services/agents/` is the *engine* that runs an agent. `agents/` at the root is *who the agents are*. Keeping
those apart is deliberate: one changes when we fix a bug, the other changes when the Firm changes its mind,
and they should never be in the same pull request.

### 1.3 `agents/` — the Firm as data

```
agents/
├── firm.toml                        # departments, reporting lines, standing meetings, load targets
├── charters/
│   ├── kai.exec.toml       rune.cto.toml       iris.pm.toml
│   ├── vega.eng.toml       orin.ai.toml        mira.design.toml
│   ├── argus.qa.toml       atlas.devops.toml   sable.marketing.toml
│   └── cass.finance.toml   quill.docs.toml
├── playbooks/                       # reusable procedures agents may invoke
├── workflows/                       # shipped deterministic DAGs
├── prompts/                         # shared fragments: brief format, dissent protocol, refusal handling
└── evals/
    ├── delegation/                  # 40 labelled Directives → expected staffing
    ├── briefs/                      # rubric fixtures
    ├── honesty/                     # Directives whose correct answer is "I don't know"
    └── retrieval/                   # 200 labelled query/document pairs
```

Promoting this to the top level makes a claim the earlier layout only implied: **charters are product, not
configuration.** They are versioned, reviewed, and gated by the evaluation sets sitting beside them — a
charter change that regresses `agents/evals/` does not merge. Burying them in `config/` invited them to be
edited like a settings file.

### 1.4 `packages/` — shared libraries

```
packages/
├── domain/          # sidra-domain — pure types and invariants, zero I/O, zero dependencies
├── bindings/        # GENERATED from domain via ts-rs — editing fails CI
├── design/          # tokens.json → tokens.css, themes, typography, motion primitives
├── ui/              # the 48-component library: primitives, surfaces, data, agentic, overlays
├── tool-sdk/        # Rust helpers for authoring first-party tools
├── plugin-sdk/      # WIT interfaces + Rust/Go templates for third-party plugins
└── testkit/         # fake provider, seeded vaults, crash-injection harness, fixture builders
```

`packages/domain` is the root of the dependency graph and depends on nothing. `packages/ui` knows about
design tokens and nothing about the kernel — it takes props. If a component needs a kernel type, it takes it
from `packages/bindings`, which is generated, which means the type cannot drift.

### 1.5 `infrastructure/` — how it is built, signed, shipped, proven

```
infrastructure/
├── ci/                              # GitHub Actions: build, test, eval, chaos, perf-gate, release
├── build/                           # per-platform packaging, notarization, code signing
├── release/                         # update manifest generation, changelog, artifact checksums
├── testing/
│   ├── integration/                 # kernel-level, real SQLite
│   ├── chaos/                       # kill -9 at every state transition
│   ├── redteam/                     # hostile tool + plugin suite
│   ├── injection/                   # the prompt-injection corpus
│   ├── perf/                        # the budget gates from testing-and-quality §6
│   └── e2e/                         # WebDriver against the packaged app, three platforms
├── fixtures/                        # seeded vaults, one per released schema version
└── scripts/                         # migration rehearsal, token contract check, dependency audit
```

Code signing and three-platform packaging live here from M1, not from M9. A signing problem discovered late
is a two-week outage; discovered on day one it is an afternoon.

### 1.6 `workspace/` — local runtime scratch

```
workspace/                           # .gitignore'd in full
├── vault/                           # a development Vault; same shape as ~/Sidra/
├── models/                          # downloaded local model weights
├── cache/
└── logs/
```

**Naming note.** "Workspace" already means something in Cargo and pnpm. We accept the collision because the
directory's meaning to a person — *where this machine's working state lives* — is the more useful one, and the
tooling sense never appears as a path. The Justfile and both manifests say "workspace members" explicitly
when they mean the tooling sense.

### 1.7 Dependency direction

```
packages/domain
      ▲
      │
services/*  ────────▶  packages/{tool-sdk, plugin-sdk}
      ▲
      │
apps/*      ────────▶  packages/{ui, design, bindings}
      ▲
      │
agents/*  (data, loaded at runtime — depended on by nothing, read by services/agents)
```

Arrows point at what a thing may depend on. There are no upward arrows, no cycles, and `infrastructure/`
depends on everything while nothing depends on it. A pull request that adds an edge against this direction is
rejected by a CI check rather than by a reviewer's memory.

### 1.8 Rules

1. `packages/bindings` is generated — editing it fails CI.
2. `packages/domain` may not depend on any I/O crate. Enforced by `cargo-deny`.
3. `services/*` may not depend on `apps/*`, and no service may depend on Tauri.
4. `packages/ui` may not import from `services/*` or from any app.
5. No file exceeds 400 lines without a justification comment on line 1.
6. A feature folder owns its components; `packages/ui` holds only what two or more features use.
7. Anything in `agents/` is data: no code, no logic, no conditionals expressed as prompt strings.
8. Nothing in `workspace/` is ever committed, and nothing in the product ever reads from it by default path.

## 2. The Vault

The Principal's data. One directory, portable, encrypted, readable without this application.

```
~/Sidra/                             # location chosen at first run
├── sidra.db                         # SQLCipher: all records, chunks, vectors, events
├── sidra.db-wal
├── vault.key.enc                    # key wrapped by OS keychain / passphrase
├── firm.toml                        # firm configuration
│
├── config/
│   ├── agents/                      # charter overrides, versioned
│   ├── playbooks/
│   ├── workflows/
│   └── keys.enc                     # provider credentials, encrypted, never in DB
│
├── Artifacts/                       # everything the Firm produced
│   └── 2026/
│       └── 07/
│           └── eng_01J8.../         # one folder per Engagement
│               ├── spec-invoicing.md
│               ├── spec-invoicing.v1.md      # prior versions kept
│               └── _meta.json                # provenance, reviewers, sources
│
├── Sources/                         # everything ingested, original bytes preserved
│   ├── documents/
│   ├── web/                         # archived fetches with URL + timestamp
│   └── images/
│
├── Records/                         # human-readable mirrors of key records (Markdown)
│   ├── briefs/2026-07-21-morning.md
│   ├── decisions/DEC-0042-billing-provider.md
│   └── minutes/MTG-0117-decision-forum.md
│
├── Exports/                         # user-initiated exports
├── .snapshots/                      # automatic DB snapshots
└── .trash/                          # tombstoned items, purgeable
```

**Why the Markdown mirror exists.** Principle 7: the Vault must outlive the app. The database is canonical
for the running system, but every Brief, Decision, and set of Minutes is also written as plain Markdown with
YAML front-matter. If Sidra OS disappears, the Principal still owns a readable, greppable company archive.
The mirror is written after commit and is never read back as truth.

## 3. Naming conventions

| Thing | Convention | Example |
|---|---|---|
| IDs | ULID with a type prefix | `eng_01J8ZK4M…`, `wo_01J8ZK5P…`, `dec_01J8ZM1Q…` |
| Rust | snake_case files, PascalCase types | `work_order.rs`, `WorkOrder` |
| TypeScript | PascalCase components, camelCase hooks | `ProgressSpine.tsx`, `useEngagement.ts` |
| CSS tokens | `--sd-{category}-{name}-{variant}` | `--sd-color-surface-raised` |
| Events | `subject.verb_past` | `work_order.accepted` |
| Commands | `subject.verb` | `mandate.authorize` |
| Migrations | `NNNN_description.sql` | `0007_add_canon_confidence.sql` |
| Artifact files | `kebab-case`, versioned by suffix | `pricing-model.v3.xlsx` |
