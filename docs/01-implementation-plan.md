# Implementation Plan

Ten milestones from empty repository to 1.0 "Atrium". This plan is a sequence of *provable* states, not a
calendar. Each milestone has an exit criterion that can be demonstrated to someone who does not trust you.

No production code is written until this documentation set is approved; this document describes the order in
which it would be written.

## 1. Sequencing principle

Build the substrate before the intelligence. The parts of Sidra OS that are hardest to retrofit are the event
log, the capability broker, and the memory schema — all three are load-bearing for correctness and all three
become impossible to change once there is real user data. The parts that are easy to change late are prompts,
agent personalities, and visual polish.

So: **storage → security → orchestration → agents → engines → surface → hardening.** The demo is ugly until
M7 and that is correct.

## 2. Milestones

### M1 — Shell and skeleton
Tauri 2 application launching on macOS, Windows, Linux. Repository laid out per ADR-0011, with every crate under
`services/`, `packages/`, and `apps/` stubbed and building. React 19 renderer with the token contract wired, one route, and the Rail rendering. IPC round-trip
proven with one command. CI building signed artifacts for three platforms from day one, because code-signing
discovered in month five is a two-week outage.

**Exit:** `sidra` launches on three platforms, shows an empty Lobby, and CI produces installers on every push.

### M2 — Vault and event log
SQLite via rusqlite with SQLCipher. `refinery` migrations, forward-only, with a migration test that runs every
migration against a seeded database. The `events` table with SHA-256 hash chaining, append API, and a
verification routine. Projection framework: one projection rebuilt from events on demand.

**Exit:** Write 10,000 events, kill the process mid-write, relaunch, verify the chain, rebuild all projections
from scratch, and get byte-identical state. This is the milestone that makes every later claim about
durability true.

### M3 — Security kernel
Capability model, Permission Broker as the single choke point, effect classes 0–3, Fences, the approval path,
and the OS keychain integration. Egress allowlist enforced at the HTTP client layer. Provenance tagging
implemented in the message envelope type so it cannot be forgotten later.

**Exit:** A red-team test suite in which a deliberately malicious tool implementation attempts filesystem
escape, unlisted egress, capability escalation, and log tampering — all four denied and logged.

### M4 — Model gateway and routing
Model Class abstraction, provider bindings, the deterministic routing table, streaming, retries with jitter,
schema-validated structured output, token accounting, the three nested budget ceilings, and the failure
ladder. Cache with content-addressed keys.

**Exit:** A synthetic workload of 500 calls across all five classes stays within a $2 ceiling, never exceeds
it by a cent, fails over correctly when a provider is blackholed, and reconciles estimated against actual cost
within 5%.

### M5 — Memory
Five layers. `sqlite-vec` embeddings, FTS5 lexical index, hybrid retrieval with RRF and MMR, Canon with trust
levels, and the Night Shift consolidation pipeline's nine stages.

**Exit:** A retrieval evaluation set of 200 hand-labelled query/document pairs, with hybrid retrieval beating
both pure-vector and pure-lexical baselines on recall@10, and a measured p95 retrieval latency under 120 ms on
a 100k-chunk corpus.

### M6 — Orchestrator and the first three agents
Turn lifecycle, Work Order contract, Engagement tree, the CEO protocol's six phases, the fast lane, and
Kai + Rune + Vega only. Real delegation, real review, real Brief.

**Exit:** A Directive with genuine substance ("audit this repository for dependency risk and tell me what to
do") produces a correct Brief through real delegation, under budget, with a complete and verifiable trace.

### M7 — The full Firm and the engines
Remaining eight agents with their charters and KPIs. Workflow engine, meeting engine, decision engine,
automation engine, knowledge base ingestion, notification ladder.

**Exit:** A week of daily use by the team building it, with standups and weekly reviews running unattended,
six shipped automations enabled, and no manual database intervention required.

### M8 — The building
Night Atrium implemented in full: all 48 components, all rooms, Command Palette, Search Everywhere, Inspector,
Dock, Ledger Line, the complete keymap, both themes, reduced-motion parity. Accessibility audit to WCAG AA.

**Exit:** Cold start ≤1.2 s, sustained 60 fps during a running Engagement with the Progress Spine animating,
idle memory ≤400 MB, and a keyboard-only walkthrough of every primary journey with no dead ends.

### M9 — Plugins and extensibility
Wasmtime Component Model host, the four extension points, manifest and capability grants, signing, the
developer-mode path, and two reference plugins built end-to-end by someone outside the core team.

**Exit:** An external developer, given only `08-plugin-system.md`, ships a working tool plugin in under a day
without asking a question that the document should have answered.

### M10 — Hardening and 1.0
Crash-recovery matrix, corruption recovery, migration rehearsal from every prior schema version, full export
and re-import round-trip, second security review including prompt-injection corpus, performance regression
suite in CI, installer and update channel, and documentation for the Principal rather than the builder.

**Exit:** Thirty days of dogfooding with zero data-loss incidents, zero unlogged effects, and every open
defect either fixed or explicitly accepted in writing.

## 3. Dependencies and the critical path

```
M1 ──▶ M2 ──▶ M3 ──▶ M4 ──▶ M6 ──▶ M7 ──▶ M8 ──▶ M10
              │       │      ▲       │      ▲
              └─▶ M5 ─┴──────┘       └─ M9 ─┘
```

M5 (memory) can proceed in parallel with M4 once M3 lands, because retrieval does not need the gateway to be
finished — only its interface. M9 (plugins) can start after M7 and must land before M10 so its capability
surface is included in the second security review. Everything else is strictly serial: skipping ahead means
building on a substrate whose invariants are not yet proven.

## 4. Rules the build follows

1. **No milestone completes without its exit criterion demonstrated**, in a recording or a live walkthrough.
   "Substantially done" is not a state.
2. **Schema changes stop the line.** Any change to the event log or the memory schema after M5 requires an
   ADR and a rehearsed migration, including a downgrade story.
3. **Prompts are data, not code.** Agent charters live in versioned files with an evaluation set attached; a
   charter change that regresses the evaluation set does not ship.
4. **Every effectful path gets a test that proves the log entry exists.** The audit trail is tested as a
   feature, not assumed as a side effect.
5. **Performance budgets are CI gates from M1**, not a phase at the end. A regression fails the build with the
   number that regressed.
6. **The team uses it daily from M6.** A product about delegation cannot be evaluated by people who have never
   delegated anything to it.

## 5. Known risks

| Risk | Signal it is happening | Response |
|---|---|---|
| Orchestration complexity outruns the team | M6 slips twice | Cut to five agents for 1.0; the org chart is data, not architecture |
| Model quality insufficient for genuine delegation | Briefs need editing more than 30% of the time | Narrow 1.0's advertised scope to the domains where it is strong; do not widen prompts to compensate |
| Retrieval quality plateaus | recall@10 below 0.8 at M5 | Add a reranker as a `worker`-class Turn; the routing table absorbs this without architectural change |
| Webview inconsistency | Visual defects that only appear on one platform | Conservative CSS baseline, per-platform QA gate at M8, and a documented list of what we do not use |
| Scope creep via plugins | Core features being deferred "to a plugin" | Plugins extend; they never complete a shipped promise. Enforced at review. |
