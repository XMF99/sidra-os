# Executable Artifacts — Implementation Plan

**Milestone M20 · crate `sidra-artifacts-exec` · for AntiGravity**

| | |
|---|---|
| Architecture | `EXECUTABLE_ARTIFACTS_ARCHITECTURE.md` (this package) — decides behaviour |
| ADRs | 0054 (grant ⊆ producing Work Order) · 0055 (reuse the M9 Wasm host, no new sandbox) · 0056 (recorded provenance is the grant source) |
| Crate | `sidra-artifacts-exec` at `services/artifacts-exec/` |
| Depends on | `sidra-plugins` (M9 host), `sidra-security` (Broker, effect classes, redaction), `sidra-store`, `sidra-connectors` (M16, external-effect path only), `sidra-domain` |
| Must not depend on | `sidra-orchestrator`, `sidra-mission` (CI-enforced) |

---

## 0. How to use this document

### 0.1 Relationship to the architecture

The architecture decides *what is true*; this plan decides *what to build and in what order*. Where this plan
appears to contradict the architecture, the architecture is right and this plan is a defect to report. No task
here re-opens an ADR.

### 0.2 Task conventions (inherited from the Mission Engine plan §0.4 and the M16 plan, unchanged)

- **One task = one commit = one review.** A task that cannot be reviewed in one sitting is too large; split it
  before starting.
- **Complexity is reviewer load, not calendar time.** **S** ≈ under 200 lines, one concept · **M** ≈ 200–600
  lines or one concept with real edge cases · **L** ≈ 600+ lines or cross-module. **There are no XL tasks.**
- **Every task ships its own tests.** No "tests follow later." A task without tests is not done.
- **Every task leaves `main` green.** Feature-flag if incomplete; never break the build.
- **No production code in this package.** This plan is the specification AntiGravity implements.

### 0.3 Epic map

| Epic | Name | Delivers |
|---|---|---|
| E1 | Executable-artifact domain model & provenance | the vocabulary: ids, the executable-artifact record, the run record, the recorded producing Work Order (ADR-0056) |
| E2 | Grant derivation (⊆ Work Order) & enforcement | ADR-0054: `frozen = requested ∩ work_order.capability_grant`, frozen, over-request refused |
| E3 | Run host on the existing M9 Wasm sandbox | ADR-0055: instantiate via `sidra-plugins`; no new sandbox; effective-grant computation; resource bounds |
| E4 | Broker / effect integration & audit | every effect through `authorize_action`; the M9 broker-mediated host functions; run records on the hash chain |
| E5 | Persistence 0039–0041 & events | additive migrations, event variants, the Vault Markdown mirror |
| E6 | Capability-bound execution acceptance | the exit-criterion denial proof and the acceptance harness — **the last thing green** |

### 0.4 Recommended implementation order

```
E1 ──► E2 ──┐
     │      ├──► E3 ──► E4 ──► E6
     └──► E5 (schema before E1/E4 write to it)
```

E1 first (everything types against it). E2 next (the grant is the milestone's heart; nothing runs without it).
E5 lands the schema just ahead of E1's and E4's writes. E3 needs E2 (a run needs a frozen grant) and reuses the
M9 host. E4 wires effects through the Broker and emits audit. E6 closes the milestone; **E6 is the exit
criterion and must be the last thing green — specifically its final task, the bounding-refusal proof.**

---

## E1 — Executable-artifact domain model & provenance

### Purpose
The vocabulary every other epic types against: ids, the executable-artifact record, its recorded producing Work
Order (ADR-0056), the frozen-grant type, and the run record.

### Scope
In: value objects and aggregates in `packages/domain` (or `services/artifacts-exec/domain` per the crate's
dependency rules); the manifest struct; the provenance binding. Out: derivation logic (E2), execution (E3),
persistence writes (E5).

### Dependencies
`sidra-domain` (`Capability`, `EffectClass`, `WorkOrderId`, `ArtifactId`, `EngagementId` — reuse; introduce
none that the M15 substrate already exports).

### Public APIs
Constructors that reject invalid construction; no widening mutators on the grant or the manifest.

### Acceptance criteria
Every type rejects invalid construction; `ArtifactCapabilityGrant` cannot be constructed without a
`WorkOrderId`; the manifest parses only the security-model capability grammar; property tests over each.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T1.1** | Scaffold `sidra-artifacts-exec` crate: manifest, module skeleton, CI wiring, dependency-direction check | S | — | `services/artifacts-exec/Cargo.toml`, `src/lib.rs`, `infrastructure/ci/` | Crate builds; CI fails on any edge to `sidra-orchestrator` or `sidra-mission` (AC13) |
| **T1.2** | Value objects: `ArtifactId` (reuse), `ModuleHash`, `ArtifactRunId`, reuse `Capability`/`WorkOrderId`/`EngagementId` | S | T1.1 | `domain/values.rs` | `ModuleHash` is a SHA-256; capabilities parse only the security-model grammar; property tests |
| **T1.3** | `ExecutableArtifact` aggregate: `artifact_id`, **`producing_work_order_id` (required)**, `module_hash`, `entrypoint`, `requested_capabilities`, `limits`, `api_version`, `signature`, `status` | M | T1.2 | `domain/artifact.rs` | Cannot construct without a `producing_work_order_id` (ADR-0056); immutable; no mutator on requested caps |
| **T1.4** | `ArtifactCapabilityGrant`: `artifact_id`, **`derived_from_work_order` (required)**, `frozen_grant`, timestamps, actor, `revoked_at` | S | T1.2 | `domain/grant.rs` | Cannot construct without a `WorkOrderId`; exposes **no** grant-widening mutator (ADR-0054); unit tests |
| **T1.5** | `ArtifactRun` + `EffectRecord`: run id, invoking Work Order, effective grant, fuel/wall, outcome, per-effect Broker verdict | S | T1.2 | `domain/run.rs` | `outcome` covers ok/fuel/epoch/memory/denied/error; `EffectRecord` carries the effect class and verdict |
| **T1.6** | Manifest struct + parser for the artifact `.toml` (§5.1): `[artifact]`, `[provenance]`, `[requested_capabilities]`, `[limits]`, `[signature]` | M | T1.3 | `domain/manifest.rs` | `[provenance].producing_work_order` required; `[requested_capabilities].caps` parse the grammar; no net/host/credential field exists |
| **T1.7** | `WasmLimits`: fuel/memory_mb/wall_ms, bounded by the M9 host defaults | S | T1.2, `sidra-plugins` | `domain/limits.rs` | A limit above the M9 default is rejected at construction (§5.4 check #7) |

---

## E2 — Grant derivation (⊆ Work Order) & enforcement (ADR-0054)

### Purpose
The bounding primitive and its enforcement — the heart of the milestone. Compute `frozen = requested ∩
work_order.capability_grant`, freeze it, refuse over-requests, and compute the run-time effective grant.

### Scope
In: reading the producing Work Order's `capability_grant`, the intersection, the over-request refusal, freezing,
and the run-time `frozen ∩ firm_policy ∩ session_grants`. Out: instantiation (E3), the Broker call per effect
(E4).

### Dependencies
E1; the M15 Work Order store (read `work_orders.capability_grant`); `sidra-security` (firm policy, session
grants).

### Public APIs
`derive_artifact_grant(artifact_id) -> Result<ArtifactCapabilityGrant, GrantRefused>`;
`effective_grant(grant, firm_policy, session) -> Set<Capability>`.

### Acceptance criteria
`frozen ⊆ producing_work_order.capability_grant` always; a requested capability outside the Work Order grant is
refused, naming it, before the artifact is runnable; `effective ⊆ frozen` always.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T2.1** | Resolve the producing Work Order and load its `capability_grant` (the ceiling) | S | E1, E5/T5.1 | `grant/resolve.rs` | Unresolvable Work Order → artifact cannot proceed to derivation (ADR-0056); one lookup, one answer |
| **T2.2** | Derive `frozen = requested ∩ work_order.capability_grant`; freeze it | M | T2.1 | `grant/derive.rs` | `frozen ⊆ work_order.capability_grant` asserted; the frozen grant is immutable after write |
| **T2.3** | Over-request refusal: a requested capability ∉ the Work Order grant → `GrantRefused`, naming it | M | T2.2 | `grant/derive.rs` | Refusal is hard, names the offending capability, grant never frozen (the exit criterion; §13.2) |
| **T2.4** | Run-time effective grant: `frozen ∩ firm_policy ∩ session_grants` (intersection, never union) | M | T2.2, `sidra-security` | `grant/effective.rs` | `effective ⊆ frozen` always; a firm capability revoked since authoring is absent (G7, AC8) |
| **T2.5** | Grant revocation: close the grant, mark the artifact non-runnable, history immutable | S | T2.2 | `grant/revoke.rs` | Revoke sets `revoked_at`; no run occurs afterward; prior grant record never rewritten |

---

## E3 — Run host on the existing M9 Wasm sandbox (ADR-0055)

### Purpose
Instantiate and run the artifact in the M9 host, reused verbatim, under the computed effective grant, within the
M9 resource bounds. **No new sandbox.**

### Scope
In: validation (§5.4), instantiation via `sidra-plugins`, the no-ambient-authority WIT world check, fuel/epoch/
memory application, run lifecycle and termination. Out: per-effect Broker routing (E4).

### Dependencies
E1, E2; `sidra-plugins` (the M9 host, WIT world, fuel metering, epoch deadline).

### Public APIs
`validate_executable_artifact(artifact_id) -> Result<(), ValidationError>`;
`run_artifact(artifact_id, invoking_work_order, args) -> RunResult`.

### Acceptance criteria
The artifact runs in the M9 host with no new sandbox; a component importing ambient authority is refused; each
resource limit terminates a run cleanly.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T3.1** | Validation checks 1–5 (schema, signature via M9 chain, module hash/component valid, no ambient authority, provenance resolves) | M | E1, `sidra-plugins` | `validate/mod.rs` | Check #4 refuses a component importing fs/clock/net/socket/randomness (ADR-0006, ADR-0055) |
| **T3.2** | Validation checks 6–9 (requested ⊆ Work Order grant, limits ≤ host defaults, no credential material, grammar-valid caps) | M | T3.1, E2 | `validate/mod.rs` | Check #6 refuses a requested capability absent from the Work Order grant, naming it |
| **T3.3** | Instantiate via the M9 host: one Wasmtime instance per run, the no-ambient-authority world, entrypoint export | M | T3.1, `sidra-plugins` | `run/instantiate.rs` | Uses `sidra-plugins`; the crate defines no second host and no new WIT interface (ADR-0055) |
| **T3.4** | Apply resource bounds from `[limits]` bounded by host defaults; fuel/epoch/memory termination with typed errors | M | T3.3 | `run/bounds.rs` | Each of fuel/epoch/memory forced in a test terminates cleanly; nothing new dispatched after (AC9) |
| **T3.5** | Run lifecycle: `Runnable → Executing → Executed`; compute effective grant at run start; state guards | M | T3.3, E2/T2.4 | `run/lifecycle.rs` | A run begins only from `Runnable`/`Audited`; illegal transitions rejected (invariant §3.4.1) |

---

## E4 — Broker / effect integration & audit

### Purpose
Route every effect the artifact has through the Permission Broker under the operation's effect class, using only
the M9 broker-mediated host functions, and record every run and effect on the hash chain.

### Scope
In: the host-function shims (Vault, memory, connector, kv, log), the `authorize_action` call per effect, effect-
class routing, the external-effect path via M16, and audit emission. Out: nothing new — this epic wires effects
to the choke point.

### Dependencies
E3; `sidra-security` (Broker, effect classes, redaction); `sidra-connectors` (M16, for the external-effect
path); `sidra-plugins` (the host-function bridge).

### Public APIs
The host-function set exposed to the guest world (all Broker-routed); `audit` emission of run/effect events.

### Acceptance criteria
Every effect passes the Broker; the host-function set is a subset of the M9 set; external reach is only via a
granted connector; every run and effect is an audited event.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T4.1** | Host-function shims for local effects (`vault.read`/`vault.write`/`mem.*`/`kv_*`/`log`), each routing through the Broker with the operation's effect class | L | E3, `sidra-security` | `host_fns/local.rs` | Each shim calls `authorize_action`; a capability not in `effective` returns `fenced`; writes are class-2, versioned |
| **T4.2** | Effect-class routing: class 0 auto within grant, class 1 external read, class 2 approval-by-default for external writes, class 3 always-ask | M | T4.1, `sidra-security` | `host_fns/effect.rs` | Policy matches security model §5 exactly (AC4); an artifact cannot lower an operation's class |
| **T4.3** | External-effect path: `connector.invoke` routes through M16 custody + egress; the artifact holds no credential and names no host | M | T4.1, `sidra-connectors` | `host_fns/connector.rs` | Custody injects at egress (ADR-0034); host allowlisted (ADR-0036); no token in the artifact address space (AC10) |
| **T4.4** | No-new-host-function guard: the artifact host-function set is a compile-checked subset of the M9 set | S | T4.1 | `infrastructure/ci/` | A host function not present as an M9 Broker-routed shim fails the build (ADR-0055, AC13) |
| **T4.5** | Audit emission: `ArtifactRun` + `EffectRecord` events, secrets stripped, on the hash chain | S | T4.1, E5/T5.6 | `audit/emit.rs` | Every run/effect/deny emits an event; `audit.verify` passes over a lifecycle fixture (AC12) |

---

## E5 — Persistence 0039–0041 & events

### Purpose
Additive, forward-only schema in band `0039`–`0041`; the event variants; the human-readable Vault mirror.

### Scope
In: migrations `0039_*`–`0041_*`, the `ArtifactEvent` variants, the Vault mirror writer. Out: business logic.

### Dependencies
`sidra-store`; the M16 connector migrations end at `0029`; M17–M19 reserve intervening bands; M20 uses `0039`–
`0041`.

### Acceptance criteria
Forward-only, idempotent, independently deployable; null executable-artifact set = pre-M20 behaviour; the mirror
holds no secret and no widened grant.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T5.1** | `0039_executable_artifacts.sql` — `artifact_id` (FK), `producing_work_order_id` (FK, **NOT NULL, ON DELETE RESTRICT**), `module_hash`, `entrypoint`, `requested_capabilities` (JSON), `limits` (JSON), `api_version`, `signature`, `status` | S | — | `services/store/migrations/` | Forward-only; `producing_work_order_id` NOT NULL (ADR-0056); idempotent; independently deployable |
| **T5.2** | `0040_artifact_capability_grants.sql` — `artifact_id` (FK), `derived_from_work_order` (FK, NOT NULL), `frozen_grant` (JSON), `computed_at`, `computed_by`, `revoked_at` | S | T5.1 | `migrations/` | No column can hold a widened grant; `frozen_grant` written once (ADR-0054) |
| **T5.3** | `0041_artifact_runs.sql` — `id`, `artifact_id` (FK), `invoked_by`, `invoking_work_order`, `effective_grant` (JSON), `fuel_used`, `wall_ms`, `outcome`, `effects` (JSON, secrets stripped), `at` | S | T5.1 | `migrations/` | Stores effective grant + bounded effect log, no secret |
| **T5.4** | Migration test against a pre-M20 fixture Vault: null executable-artifact set behaves exactly as before | S | T5.1–T5.3 | `migrations/tests/` | A Firm with no executable artifacts is byte-behaviour-identical to pre-M20 (G10) |
| **T5.5** | `ArtifactEvent` enum — the 14 variants (§11.2) with actor + artifact_id (+ producing_work_order_id) | M | E1 | `domain/events.rs` | Every kind in §11.2 present; `ArtifactGrantRefused` names the capability; serde round-trip; schema snapshot committed |
| **T5.6** | Vault Markdown mirror writer (on state transitions, not continuously) | M | T5.5 | `mirror/write.rs` | `artifact.md`/`grant.md`/`runs/` written; no credential and no widened grant appears |

---

## E6 — Capability-bound execution acceptance

### Purpose
The exit criterion, made a test. **The last thing to go green.** The bounding-refusal proof (T6.1) is the final
task of the final epic.

### Scope
In: the bounding-refusal harness (the exit criterion), the grant-subset property test, the no-ambient-authority
test, the reuse-does-not-lend-privilege test, the resource-bound tests, the connector-path test, and the AC
coverage. Out: any artifact itself, and any first-party executable (out of scope for M20).

### Dependencies
All prior epics.

### Acceptance criteria
AC1–AC13 each covered by a named test; the bounding proof (AC3) asserts a request beyond the Work Order grant is
refused with nothing instantiated.

### Tasks

| ID | Task | Cx | Deps | Files / modules | Acceptance criteria |
|---|---|---|---|---|---|
| **T6.2** | End-to-end bounded run: author → validate → derive grant → run → result, all effects Broker-approved | M | E3, E4 | `infrastructure/testing/artifacts-exec/e2e_run.rs` | AC1, AC2, AC4 — an agent-authored artifact executes in the M9 sandbox and returns a result |
| **T6.3** | Grant-subset property test over a generated corpus of `(requested, work_order_grant)` pairs | M | E2 | `.../grant_subset.rs` | AC6 — `frozen ⊆ work_order_grant` in every case; over-request always refused naming the capability |
| **T6.4** | No-ambient-authority test: the guest world contains no fs/clock/net/socket/randomness; a component importing one is refused | M | E3 | `.../no_ambient_authority.rs` | AC5 — the ADR-0006 sandbox property holds for the M20 guest world |
| **T6.5** | Reuse-does-not-lend-privilege test: WO_A-authored artifact run inside a higher-grant WO_B stays bounded by WO_A | M | E3, E4 | `.../reuse_no_privilege.rs` | AC7 — authority is the frozen grant (producer), not the invoker's grant (§13.3, F5) |
| **T6.6** | Resource-bound tests: force fuel exhaustion, epoch deadline, memory cap; assert clean termination | M | E3 | `.../resource_bounds.rs` | AC9 — each limit terminates cleanly; already-approved effects stand; nothing new dispatched |
| **T6.7** | Firm-capability-revocation test: a capability revoked after authoring is absent from the next run's effective grant | S | E2 | `.../firm_revocation.rs` | AC8 — `effective` narrows with no artifact change (G7, F3) |
| **T6.8** | Connector-path test: external reach only via a granted connector; custody injects at egress; no token in the artifact | M | E4, `sidra-connectors` | `.../connector_path.rs` | AC10 — the M16 custody/egress path is the only outbound route |
| **T6.9** | Install-confers-nothing test: a distributed artifact arrives grant-less and is not runnable until a Work Order derives a grant | S | E2 | `.../install_confers_nothing.rs` | AC11 — reconciles GUIDE §12 (§7.4) |
| **T6.10** | CI checks: no-new-host-function subset check; dependency-direction check | S | E1, E4 | `infrastructure/ci/` | AC13 — build fails on a new host function or an edge to orchestrator/mission |
| **T6.1** | **Bounding-refusal proof (the exit criterion):** an artifact requesting a capability beyond its producing Work Order's grant is refused, structurally, before the artifact is runnable — nothing instantiated, nothing dispatched | M | E2, E3, E4 | `.../bounding_refusal.rs` | AC3 — `GrantRefused` naming the capability; grant never frozen; **the last test to go green** |

> **Ordering note.** T6.1 is numbered first for prominence but is the **last** task implemented and the last to
> go green — it is the exit-criterion proof. Everything else in E6 must pass before T6.1 is meaningful, because
> T6.1 asserts the *absence* of a capability the rest of the pipeline is proven to honour when present.

---

## Deliverables summary

| Epic | Primary deliverable |
|---|---|
| E1 | executable-artifact domain types + recorded provenance (ADR-0056) |
| E2 | grant derivation ⊆ Work Order + enforcement (ADR-0054) |
| E3 | run host on the reused M9 Wasm sandbox (ADR-0055) |
| E4 | Broker/effect integration + audit |
| E5 | migrations 0039–0041, events, Vault mirror |
| E6 | capability-bound execution acceptance + the bounding-refusal exit-criterion proof |
