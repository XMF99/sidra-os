# Structure — Implementation Plan

**Milestone M12 · no new crate (extends `sidra-departments`, `sidra-security`, `sidra-orchestrator`,
`sidra-agents`, `sidra-domain`) · for AntiGravity**

| | |
|---|---|
| Architecture | `STRUCTURE_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | Consolidates 0012 (Divisions), 0015 (Offices/vetoes), 0004 (five tools), 0014 (archetype/instance). New: **0042** (firm-wide veto enforcement point) |
| Crates extended | `sidra-domain`, `sidra-departments`, `sidra-security`, `sidra-orchestrator`, `sidra-agents`, `sidra-store`, `apps/*` |
| Depends on | **M11** (Registrar org graph, Guard Runner, Standards Engine, Exchange, replay-equivalence test), M3 (Broker), M2 (event log) |
| Migration band | `0007`–`0010`, additive, forward-only (`/docs/04-database-design.md` §10) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR (`/MASTER_IMPLEMENTATION_GUIDE.md` §8).

### 0.2 Task conventions (inherited from the Mission Engine / M16 plans, unchanged)

- **One task = one commit = one review.** A task that cannot be reviewed in one sitting is too large; split it
  before starting.
- **Complexity is reviewer load, not calendar time.** **S** ≈ under 200 lines, one concept · **M** ≈ 200–600
  lines or one concept with real edge cases · **L** ≈ 600+ lines or cross-module. **There are no XL tasks.**
- **Every task ships its own tests.** No "tests follow later." A task without tests is not done.
- **Every task leaves `main` green.** Feature-flag if incomplete; never break the build
  (`/MASTER_IMPLEMENTATION_GUIDE.md` §6).
- **Every effectful path ships a test asserting its log entry** (`/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 4).
- **No production code in this package.** This plan is the specification AntiGravity implements.

### 0.3 Epic map

| Epic | Name | Delivers |
|---|---|---|
| E1 | Division/Office domain model | the vocabulary: `Division`, `Office`, `Veto`, `DivisionExecutive`, `VetoScope`, precedence, the five-tool constraint type |
| E2 | The eight Divisions & four Offices as data + instantiation | the structure manifest; the org graph in the Registrar; named executives; Corvus + Lyra charters |
| E3 | The veto mechanism & Broker/Guard-Runner integration | ADR-0015 + ADR-0042: the firm-wide blocking veto, precedence, dissent, the dual-hat check |
| E4 | Division executives & the five-tool constraint | ADR-0012 + ADR-0004: routing Executive→Division→Department; five-tool enforcement |
| E5 | The Rail projection | the visible surface: the eight Divisions on the Rail, ⌘1–⌘8, thin projection |
| E6 | Migrations 0007–0010 | additive, forward-only schema for divisions, offices, veto records, division-executive rows |
| E7 | Firm-wide-veto conformance test + latency/token gate | the exit criterion; **the last thing to go green** |

### 0.4 Recommended implementation order

```
E1 ──► E2 ──► E3 ──► E4 ──┐
        │                 ├──► E7
        ├──► E5 ──────────┘
        └──► E6 (alongside E2 — schema before the org graph writes to it)
```

E1 first (everything types against it). E2 next (nothing exists without the structure). E6 lands the schema
just ahead of E2's writes. E3 needs E2 (a veto is held by an established Office). E4 needs E2 (a route targets
an established Division). E5 needs E2 (the Rail projects the org graph) and can proceed alongside E3/E4. E7
closes the milestone; **E7 is the exit criterion and its firm-wide-veto proof and latency/token gate must be
the last things green.**

---

## E1 — Division/Office domain model

### Purpose
The vocabulary every other epic types against: the Division, the Office, the Veto, the Division executive, and
the five-tool constraint.

### Scope
In: value objects and aggregates in `packages/domain` (`structure/`). Out: instantiation, persistence,
enforcement — those are E2/E3/E6.

### Dependencies
`sidra-domain` (`AgentId`, `DepartmentId`, `EffectClass` if present); confirm `DepartmentId` is exported by the
M11 substrate before duplicating.

### Public APIs
Constructors for each type that reject invalid construction; no mutating methods on the aggregates.

### Acceptance criteria
Every type rejects invalid construction; `DivisionExecutive` cannot hold a tool set of any size but five;
`Office` cannot own a department or Deliverable; property tests over each.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Value objects: `DivisionId`, `OfficeId`, `VetoScope` enum (Quality/Cost/Architecture/Security), `Precedence` (1–4) | S | — | `domain/structure/values.rs` | `VetoScope` has exactly four variants; `Precedence` constrained 1–4; property tests |
| **T1.2** | `Division` aggregate: id, name, `executive: AgentId`, `departments: Set<DepartmentId>` (0–4), budget_share | S | T1.1 | `domain/structure/division.rs` | ≤4 departments without a split flag; owns no Deliverable (no such field); immutable |
| **T1.3** | `Office` aggregate: id, name, head, `veto_scope`, precedence, `home_division: Option` | S | T1.1 | `domain/structure/office.rs` | Owns no `DepartmentId` and no Deliverable (type carries neither); `home_division` set only for Architecture/Security |
| **T1.4** | `DivisionExecutive`: division, agent, `tools: Set<ToolName>` fixed at the five, appointed_at | S | T1.1 | `domain/structure/executive.rs` | Cannot construct with a tool set != {retrieve,delegate,convene,decide,report} (ADR-0004); unit tests |
| **T1.5** | `Veto`: office, scope, subject_type/id, author_division, reviewer, verdict, dissent_id, overridden_by | M | T1.1 | `domain/structure/veto.rs` | `verdict=Overridden` constructible only with `overridden_by = principal`; scope must match the office |

---

## E2 — The eight Divisions & four Offices as data + instantiation

### Purpose
Turn the structure manifest into an established org graph: eight Divisions with named executives, four Offices
with scoped vetoes — the skeleton the exit criterion counts.

### Scope
In: the structure manifest parser/validator, the org graph in the Registrar, the establishing commands and
events, the two new named charters (Corvus, Lyra) and the Argus/Cass reassignment. Out: veto enforcement (E3),
routing (E4), the Rail (E5).

### Dependencies
E1, E6/T6.1–T6.2 (schema); `sidra-departments` (the Registrar org graph, M11); `sidra-agents` (charters).

### Public APIs
`apply_structure_manifest(manifest)`; `establish_division(id, executive)`; `establish_office(id, head, scope,
precedence)`; `list_divisions()`; `list_offices()`.

### Acceptance criteria
Exactly eight Divisions and four Offices establish from the manifest; establishing is a Principal Decision on
the log; a null structure leaves the M11 one-implicit-department Firm unchanged.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | Structure manifest parser → validated org graph (eight Divisions, four Offices, precedence 1–4 unique) | M | E1 | `departments/org_graph/manifest.rs` | Rejects a manifest with ≠8 Divisions or ≠4 Offices, or a duplicate precedence; round-trips the §3.1 fixture |
| **T2.2** | Org graph store in the Registrar: establish/list Divisions and Offices; persist to `divisions`/`offices` | M | T2.1, E6/T6.1, E6/T6.2 | `departments/org_graph/store.rs` | Establish is idempotent on identical manifest; graph holds exactly eight Divisions + four Offices |
| **T2.3** | `apply_structure_manifest` as a Principal Decision: emits `StructureManifestApplied` + per-node events; reversible by re-applying the prior manifest | M | T2.2, `sidra-security` | `departments/org_graph/apply.rs` | Applying is a logged Decision (Principle 14); re-applying the prior manifest reverts (migration §5); events on the hash chain |
| **T2.4** | Two new executive charters (Corvus `agent.ciso`, Lyra `agent.studio`) as data; five-tool constraint declared | S | E1 | `agents/executive/corvus.toml`, `.../lyra.toml` | Each declares exactly the five tools (ADR-0004); v1 IDs stable; charter is data, versioned |
| **T2.5** | Argus/Cass reassignment out of the delivery line into Offices; Cass does not head Finance | S | T2.2 | `agents/executive/` | Argus→Quality Office, Cass→Cost Office; neither owns a department; v1 IDs preserved (org-chart §2) |
| **T2.6** | Null-structure equivalence: with no manifest applied, the Firm is the M11 one-implicit-department Firm | S | T2.2 | `departments/org_graph/store.rs` | Replay-equivalence test stays green with no structure established (migration §6) |

---

## E3 — The veto mechanism & Broker/Guard-Runner integration (ADR-0015, ADR-0042)

### Purpose
The firm-wide blocking veto and its enforcement — the heart of the milestone.

### Scope
In: the blocking veto Guard wired through the Guard Runner at the four lifecycle points, precedence resolution,
the dissent path, the override-actor gate, and the dual-hat `reviewer_division != author_division` check. Out:
the exit-criterion proof itself (E7).

### Dependencies
E1, E2; `sidra-security` (Guard Runner + Permission Broker, M3/M11).

### Public APIs
`invoke_veto(office, subject)`; `override_veto(veto, principal, risk)`; `file_dissent(veto, department,
position)`; `office_veto_rate(office, window)`.

### Acceptance criteria
A veto blocks at the choke point firm-wide; it cannot be downgraded to a warning or overridden by a Division
executive; a dissent is recorded and surfaced; the dual-hat boundary holds.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | The blocking veto Guard: runs at pre-effect/pre-deliverable/pre-commit per Office; matches scope; emits `VetoInvoked`+`VetoUpheld` | L | E2, `sidra-security` | `security/veto/guard.rs` | The Guard blocks (never warns) on a scope match; verdict is non-downgradable by any setting or Review Intensity (ADR-0042) |
| **T3.2** | Override-actor gate: `override_veto` accepts only `principal`, only for the Security Office; records a Decision with the named risk | M | T3.1 | `security/veto/override.rs` | A Division-executive override is refused; a Principal override of Security is a Decision on the log (ADR-0015) |
| **T3.3** | Dissent path: `file_dissent` records the position verbatim, surfaces it in the Brief, halts the work | M | T3.1 | `security/veto/dissent.rs` | Dissent recorded (`dissents`), surfaced in the Brief, work does not proceed (org-chart §5) |
| **T3.4** | Precedence resolution: Security > Quality > Architecture > Cost when Offices conflict and Kai cannot resolve | M | T3.1 | `security/veto/precedence.rs` | Property test over conflicting vetoes returns the higher-precedence Office; unresolved-after-two-rounds → Approval Request (org-chart §5) |
| **T3.5** | Dual-hat boundary: `reviewer_division != author_division` for Office reviews; instantiate an Office reviewer instance when the head is conflicted | M | T3.1, `sidra-departments` | `security/veto/dual_hat.rs` | Rune/Corvus never review their own Division's artifact; a reviewer instance conducts it (org-chart §3); Argus/Cass exempt |
| **T3.6** | `veto_records` projection + `office_veto_rate`: the ceremonial-review instrument | M | T3.1, E6/T6.3 | `security/veto/rate.rs` | Rate is computable; an above-95% approval rate is flaggable as a defect (ADR-0015; agent-arch-v2 §7) |

---

## E4 — Division executives & the five-tool constraint (ADR-0012, ADR-0004)

### Purpose
Place the Divisions between the Executive and the Departments — the routing hop — and enforce the five-tool
rule on every Division executive.

### Scope
In: `route_directive` (Kai → Division → Department, depth 3), the fast-lane bypass, deterministic routing where
the Directive names a known target, and the five-tool enforcement (construction + CI). Out: the veto (E3), the
Rail (E5).

### Dependencies
E1, E2; `sidra-orchestrator` (routing); `sidra-agents` (executive charters).

### Public APIs
`route_directive(directive) -> Division`; the CI five-tool executive check.

### Acceptance criteria
A routed Directive traverses depth 3; a fast-lane Directive skips the Division hop; no Division executive holds
a sixth tool.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | Routing: Kai → Division → Department (depth 3); deterministic when the Directive names a known department/path/Application | M | E2, `sidra-orchestrator` | `orchestrator/routing/route.rs` | A routed Directive reaches a department via a Division; deterministic routing costs no model call (Principle 8) |
| **T4.2** | Fast-lane bypass: a Directive resolving to one department, one Turn, class ≤1 delegates directly, skipping the Division hop | M | T4.1 | `orchestrator/routing/fast_lane.rs` | Fast-lane Directive is depth 1; the fast-lane share is measurable against the 65% target (executive-cabinet, Kai) |
| **T4.3** | `DirectiveRoutedToDivision` event; cross-Division vs within-Division conflict resolution placement | S | T4.1 | `orchestrator/routing/events.rs` | Within-Division conflict resolves at the Division executive; only cross-Division reaches Kai (org-chart §5) |
| **T4.4** | Five-tool enforcement: construction precondition + CI check that every Division executive declares exactly five tools | S | E1, T2.4 | `infrastructure/ci/five_tool_check.rs`, `agents/executive/` | A sixth tool on any executive fails the build (ADR-0004; guide §7 kernel-neutrality-style check) |

---

## E5 — The Rail projection

### Purpose
The visible surface: the eight Divisions on the Rail, as a thin read-only projection of the org graph.

### Scope
In: the `list_divisions` query, the Rail rendering of the eight Divisions, the ⌘1–⌘8 rebind, and the
department-room-inside-Division-room navigation. Out: any routing or veto logic (E3/E4) — the Rail holds none.

### Dependencies
E2 (the org graph the Rail projects); the v1 shell/Rail surface.

### Public APIs
`list_divisions() -> [Division]`; `structure_snapshot()`.

### Acceptance criteria
The Rail shows exactly the eight Divisions; ⌘1–⌘8 bind to them; the Rail holds no logic and Layer 2 stays
replaceable.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | `list_divisions` / `structure_snapshot` queries returning a read-only org-graph snapshot | S | E2 | `departments/org_graph/query.rs` | Returns exactly eight Divisions; snapshot is immutable; no mutable graph escapes (arch §P.6 rule 2) |
| **T5.2** | Rail rendering: the eight Divisions from the snapshot; ⌘1–⌘8 rebind from v1 room bindings | M | T5.1, v1 Rail | `apps/renderer/rail/` | Rail shows eight Divisions; ⌘1–⌘8 bind; announced in the Brief on first change (migration §7) |
| **T5.3** | Department room reached inside its Division room, not from the Rail | S | T5.2 | `apps/renderer/rail/` | A department room opens within its Division room (department-arch §6) |
| **T5.4** | Layer-2 replaceability test: swap all eight Division charters; the Rail still renders eight Divisions; departments unaffected | S | T5.2 | `infrastructure/testing/structure/rail_projection.rs` | Charter swap leaves the Rail and departments intact (layer-model §9) |

---

## E6 — Migrations 0007–0010

### Purpose
Additive, forward-only schema for the structure; the projections the org graph and veto records write to.

### Scope
In: migrations `0007`–`0010`, each additive and independently deployable, each with a prior-release fixture
test. Out: business logic (E2/E3).

### Dependencies
`sidra-store`; M11 migrations (steps 1–4) end below `0007`; band 0019+ belongs to M15/M16.

### Acceptance criteria
Forward-only, idempotent, independently deployable; null structure = M11 behaviour; the five-tool CHECK holds
at the schema level.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.1** | `0007_divisions.sql` — `divisions` (id, name, executive_agent_id, budget_share, established_at); additive nullable `departments.division_id` | S | — | `services/store/migrations/` | Forward-only; idempotent; `departments.division_id` nullable (populated M13); prior-release fixture test |
| **T6.2** | `0008_offices.sql` — `offices` (id, name, head_agent_id, veto_scope, precedence, home_division_id nullable, established_at) | S | T6.1 | `migrations/` | Precedence unique 1–4; `home_division_id` nullable; independently deployable |
| **T6.3** | `0009_veto_records.sql` — audit projection (office, scope, subject, author_division, reviewer, verdict, dissent_id, overridden_by, invoked_at) | S | T6.1 | `migrations/` | Rebuildable from the event log; powers `office_veto_rate` |
| **T6.4** | `0010_division_executives.sql` — (division_id, agent_id, `tool_count CHECK (tool_count = 5)`, appointed_at) | S | T6.1 | `migrations/` | The CHECK forbids a row with a tool count other than five (schema echo of ADR-0004) |

---

## E7 — Firm-wide-veto conformance test + latency/token-budget gate

### Purpose
The exit criterion, made a test. **The last thing to go green.**

### Scope
In: the firm-wide-veto proof (the exit criterion), the latency/token CI gate against the v1 baseline (R-01),
and the acceptance-criteria coverage AC1–AC13. Out: any department itself (M13).

### Dependencies
All prior epics.

### Acceptance criteria
AC1–AC13 each covered by a named test; the firm-wide-veto proof (AC4) asserts a veto blocks firm-wide, no
Division-executive override succeeds, and the block is on the hash chain; the latency/token gate (AC6) holds
against the v1 baseline.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T7.1** | Structure-count tests: exactly eight Divisions with named executives; exactly four Offices, each scoped, none owning a department or Deliverable | S | E2 | `infrastructure/testing/structure/counts.rs` | AC1, AC2 |
| **T7.2** | Rail projection test: the Rail shows the eight Divisions; ⌘1–⌘8 bind; the Rail holds no logic | S | E5 | `.../rail.rs` | AC3 |
| **T7.3** | **Firm-wide-veto proof (the exit criterion):** an Office veto blocks an effect firm-wide at the choke point; no Division-executive override succeeds; `VetoUpheld` is on the hash chain | M | E3, E4 | `.../firm_wide_veto.rs` | **AC4 — the block is structural at the choke point, proven, not configured; the exit criterion** |
| **T7.4** | Five-tool conformance: every Division executive holds exactly five tools; a sixth fails the build | S | E4 | `infrastructure/ci/five_tool_check.rs` | AC5 |
| **T7.5** | Latency/token-budget gate: replay the v1 baseline corpus; median Directive-to-Brief latency and per-Brief token count do not regress; Brief ≤600 words | M | E4, E5 | `.../latency_token_gate.rs` | AC6 — release blocker (R-01, Principle 1) |
| **T7.6** | Routing-depth test: a routed Directive is depth 3; a fast-lane Directive is depth 1 | S | E4 | `.../routing_depth.rs` | AC7 |
| **T7.7** | Dual-hat + dissent + precedence tests | M | E3 | `.../office_boundaries.rs` | AC8, AC9, AC10 |
| **T7.8** | Veto-rate instrument test: `office_veto_rate` computable; above-95% approval flaggable as a defect | S | E3 | `.../veto_rate.rs` | AC11 |
| **T7.9** | Additivity + audit tests: null-structure Firm replays byte-identically; forward-only migrations against a prior-release fixture; every structural/veto event on the hash chain | M | E2, E6 | `.../additivity_audit.rs` | AC12, AC13 |

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | Division/Office/Veto/DivisionExecutive domain types |
| E2 | the eight Divisions + four Offices established from the structure manifest |
| E3 | the firm-wide blocking veto + Broker/Guard-Runner integration (ADR-0015, ADR-0042) |
| E4 | Divisions between Executive and Departments (routing) + the five-tool constraint (ADR-0012, ADR-0004) |
| E5 | the Rail projection showing the eight Divisions |
| E6 | migrations 0007–0010, additive and forward-only |
| E7 | firm-wide-veto proof + latency/token gate (the exit criterion) |
</content>
