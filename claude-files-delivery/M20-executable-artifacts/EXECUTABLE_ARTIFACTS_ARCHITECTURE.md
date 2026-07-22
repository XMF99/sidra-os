# Executable Artifacts — Architecture

**Milestone M20 · Release 2.5 "Field" · Layer 7 (Plugins / Wasm) · closes 2.5**

| | |
|---|---|
| Milestone | M20 — Executable Artifacts (`/MILESTONE_REGISTRY.md` §4, 2.5 "Field") |
| Release | 2.5 "Field" — the Firm reaches outside the building; **M20 is the last milestone of the release** |
| Layer | 7 — Plugins / Wasm (`/docs-v2/02-layer-model.md` §7); reuses the Layer-1 kernel host |
| New crate | `sidra-artifacts-exec` at `services/artifacts-exec/`, extending `services/plugins` |
| Depends on | M9 (Wasm plugin host & trust chain, ADR-0006), M16 (connector/capability machinery, ADR-0034–0037), M3 (Permission Broker, effect classes), M15 (Work Order & its `capability_grant`) |
| Status | Documented (this package) · implementation Open |
| Exit criterion | An agent-authored artifact executes, is capability-bounded, and **cannot exceed the grant of the Work Order that produced it** — proven by a denial test, not by configuration |

> **Authoritative precedence.** Where this document disagrees with `/docs/07-security-model.md`, the security
> model governs effect-class semantics, the capability grammar, and the Broker choke point. Where it disagrees
> with `/docs/08-plugin-system.md` or `/docs/0006-wasm-component-plugins.md` about the Wasm sandbox — fuel,
> memory, the absence of ambient authority — those govern; M20 introduces **no new sandbox mechanism**. Where
> it disagrees with `/MASTER_IMPLEMENTATION_GUIDE.md` §12 about "no artifact that arrives with autonomy," the
> guide governs and this architecture is written to honour it (§7.4). This document *extends* those boundaries;
> it never re-decides them.

---

## 1. Why this subsystem exists

### 1.1 The problem

Through M19 every artifact a Firm produces is inert. A `deliverables.artifact_id` points at a document, a
spec, a dataset, an image, a deck (`/docs/04-database-design.md` §7, `artifacts.kind`) — bytes a human or
another agent reads. An agent can *write* a script, a data transform, a validation routine, a small tool; it
cannot make the Firm *run* one. When a Work Order concludes with "a reusable CSV-normaliser" the normaliser is
Markdown describing code, not code the next Work Order can invoke.

The requirement is not "let agents run arbitrary code." An agent that can run arbitrary code is the ambient-
authority hole ADR-0006 exists to prevent, wearing a productivity face (threat T5, T8). The requirement is:
**let an agent, inside a Work Order, author an artifact that is executable — that runs in the Wasm sandbox the
Firm already ships — bounded by a capability grant that is a strict subset of the Work Order's own grant, such
that every effect it has still passes the one Permission Broker that governs every other effect, and such that
it can never, in any run, reach past what the Work Order that authored it was itself allowed to reach.**

The mechanism for running untrusted code already exists: M9 shipped it for plugins (ADR-0006). The mechanism
for bounding an effect to a capability grant already exists: M3 shipped the Broker and effect classes, M16
extended it to per-department connector grants. M20 is the small, careful join between them — an *executable
artifact* is code that runs in the M9 host under a grant derived from the M15 Work Order, mediated by the M3
Broker. It invents no runtime and no permission surface. It composes three shipped ones.

ADR-0006 anticipated exactly this. Its final consequence reads: *"the same isolation mechanism serves 2.0's
sandboxed agent-authored scripts, so we build it once."* M20 is that clause coming due. The sandbox was built
once, in M9; M20 spends it, and adds nothing to it.

### 1.2 The stance

Three commitments define executable artifacts, and each has an ADR:

1. **An executable artifact's capability grant is a strict subset (⊆) of its producing Work Order's grant,
   frozen at authoring and enforced at every run.** (ADR-0054) The grant is computed once, as the intersection
   of what the artifact requests and the `capability_grant` the producing Work Order held. It cannot be
   widened later, by anyone. At run, the effective grant is intersected again with firm policy and session
   grants (security model §4 — intersection, never union), so the artifact can only ever narrow, never exceed.
2. **An executable artifact runs in the existing M9 Wasm host. There is no new sandbox.** (ADR-0055) Fuel
   metering, memory caps, the epoch deadline, and the total absence of ambient filesystem, clock, network, and
   randomness (ADR-0006) apply unchanged. An executable artifact is a Wasm component the plugin host runs; the
   only thing new is *where its capability grant comes from* — a Work Order, not an install-time consent
   screen.
3. **Provenance is recorded and load-bearing.** (ADR-0056) Every executable artifact carries which Work Order
   authored it — and thus, transitively, which Engagement and which agent. That lineage is not decoration: it
   is the *source* of the grant. The grant is computed *from* the Work Order's `capability_grant`, so the
   provenance record and the grant are two faces of one fact. An artifact whose producing Work Order cannot be
   resolved is not runnable.

### 1.3 What the subsystem is, mechanically

The **executable-artifact runtime** is kernel machinery (Layer 1), sitting beside and depending on the M9
plugin host. The **executable artifacts** are the Layer-7 Wasm artifacts it runs — exactly as the plugin host
runs Layer-7 plugins and the connector host (M16) runs Layer-6 connector transforms. This parallel is
deliberate: it means M20 introduces no new trust mechanism. It reuses the plugin signing/loading chain
(ADR-0006), the M9 sandbox, the M3 Broker and effect classes, and the M16 custody/egress path when an artifact
reaches outward through a granted connector.

```
Layer 1  sidra-artifacts-exec  ← the runtime: grant derivation, run host, provenance, audit   (M20, THIS DOC)
Layer 1  sidra-plugins (M9)    ← the Wasm host it runs on — reused verbatim, not forked         (M9, ADR-0006)
Layer 7  an executable artifact ← a signed Wasm component authored by an agent in a Work Order  (produced at run, not installed)
```

The difference between a plugin and an executable artifact is *not* the runtime. It is the origin of authority.
A plugin's capabilities come from an install-time consent screen the Principal reads (`/docs/08-plugin-system.md`
§4). An executable artifact's capabilities come from the Work Order that authored it, bounded to ⊆ that Work
Order's grant. Neither gains authority from mere existence.

### 1.4 What the subsystem must never become

- **An autonomy escalation.** An executable artifact must never be able to do something the authoring Work
  Order could not. Its grant is ⊆ the Work Order's grant by construction (ADR-0054); the exit-criterion test
  proves a request for a capability beyond the Work Order's grant is *denied*, structurally, before the Broker.
  If an artifact could ever hold a capability its Work Order lacked, the entire delegation model — a Work Order
  narrows a charter, never widens it (security model §4) — would have a hole punched in it from below.
- **An ambient-authority sandbox.** No new host functions. No filesystem, clock, network, or randomness beyond
  what ADR-0006 already denies to every Wasm guest. An executable artifact that needs to read the Vault, reach
  a host, or spend money does so *through a capability in its grant, mediated by the Broker* — never through a
  raw syscall, because there are none.
- **A grant that outlives or exceeds its Work Order.** The grant is frozen at authoring as ⊆ the Work Order's
  grant *at that time*. It is never recomputed upward. An artifact that outlives its Engagement runs, if at
  all, under the same bounded grant it was born with, further intersected with current firm policy — so a
  capability the firm has since revoked is gone from the artifact too (§4.4, F3).
- **A bypass of the Permission Broker.** Every effect an executable artifact has — a Vault read, a connector
  call, a spend — is a tool call and passes `authorize_action` before anything happens. The runtime adds a
  grant-derivation step *ahead* of the Broker; it never replaces the choke point. There is no side door from
  Wasm to an effect that skips the Broker, because the M9 host has no such door and M20 adds none.
- **A marketplace autonomy vector.** An executable artifact distributed through the Marketplace (Layer 8)
  arrives with **no** grant, exactly like a Pack or a plugin (`/docs-v2/02-layer-model.md` §8; GUIDE §12). It
  gains a bounded grant only when an agent re-authors or adopts it inside a Work Order, and never more than
  that Work Order holds. Installation confers nothing (§7.4).

### 1.5 Relationship to existing concepts

| Existing concept | How M20 relates |
|---|---|
| M9 Wasm plugin host (ADR-0006) | Reused **verbatim** to execute the artifact. Same fuel metering, memory cap, epoch deadline, host-function set, no ambient authority. M20 supplies a different *grant source*, not a different runtime (ADR-0055). |
| Permission Broker (M3) | Every effect the artifact has passes `authorize_action` unchanged. M20 adds a grant-derivation and provenance check *before* the Broker; it removes nothing. |
| Effect classes (M3, security model §5) | An artifact's effects carry the class of the operation invoked: a Vault read is class-2, a connector read class-1, an irreversible external effect class-3 and always asks. M20 changes no class policy. |
| Work Order `capability_grant` (M15, `/docs/04-database-design.md` §2) | The **source** of the artifact's grant. The artifact grant is computed as ⊆ this JSON capability set (ADR-0054). |
| `artifacts` / `deliverables` (M15) | An executable artifact *is* an `artifacts` row (`kind='code'` extended to executable), reached from its Work Order through the existing `deliverables.work_order_id → artifact_id` chain — which is exactly the provenance M20 records (ADR-0056). |
| M16 connector custody & egress (ADR-0034/0036) | If an executable artifact makes an external call, it does so **only** through a connector granted to its Work Order's department, reusing M16's custody and egress. The artifact never holds a credential and never names a host. |
| Guards / Wasm validators (ADR-0016) | A precedent, not a dependency: ADR-0016 already runs agent-adjacent Wasm under the plugin host with fuel metering. M20 generalises the same shape to agent-*authored* executable output. |

---

## 2. Design goals

| # | Goal | Met by |
|---|---|---|
| G1 | An executable artifact can never exceed the grant of the Work Order that authored it | ADR-0054; grant computed as ⊆ `work_orders.capability_grant`; run-time Broker enforcement (§9); the exit-criterion denial test (§17 AC3) |
| G2 | Execution reuses the M9 sandbox; no new runtime, no new ambient authority | ADR-0055; the artifact is a Wasm component run by `sidra-plugins`; ADR-0006 constraints unchanged (§6, §8) |
| G3 | Every effect passes the Permission Broker | §9 fixed pipeline; the artifact's host functions are the M9 broker-mediated set only (§8) |
| G4 | Provenance is recorded and is the source of the grant | ADR-0056; `executable_artifacts.producing_work_order_id`; grant derivation reads that Work Order (§4, §9) |
| G5 | Installation via the Marketplace confers no autonomy | §7.4; a distributed artifact arrives grant-less; a grant exists only through a Work Order (reconciles GUIDE §12) |
| G6 | The grant is a frozen subset, never recomputed upward | ADR-0054; grant is immutable after authoring; run intersects with current firm policy (narrows only) |
| G7 | An artifact that outlives its Work Order is already bounded | §4.4; frozen grant + firm-policy intersection at run; a revoked firm capability is gone from the artifact (F3) |
| G8 | Execution cannot block the Mission scheduler or exhaust the machine | §15; M9 fuel/epoch/memory caps; a run is a bounded tool call within a Work Order |
| G9 | Capability-bounding is a compile/test property, not configuration | §14 + §17; the grant-subset property test and the no-ambient-authority test are CI gates |
| G10 | Everything is additive | §11 forward-only migrations `0039`–`0041`; null executable-artifact set = exactly pre-M20 behaviour |

---

## 3. State machines

### 3.1 Executable-artifact lifecycle

An executable artifact moves through authoring, validation, a runnable resting state, execution, and audit.
The states are distinct because the grant is *frozen* between authoring and runnable, and because a run must
never begin from any state but `Runnable`.

```
        author (agent emits a Wasm component as a Work Order deliverable)
  ────────────────────────────────────────────────────────►  AUTHORED
                                                                 │  validate (§5.4 install-parity checks)
                                                                 ▼
                                                             VALIDATED
                                                                 │  derive grant  (⊆ producing Work Order grant, ADR-0054)
                                                                 ▼
                                                             RUNNABLE ──────────────┐
                                                                 │  run             │ firm capability revoked
                                                                 ▼                  ▼  → grant intersects to narrower
                                                             EXECUTING          RUNNABLE (bounded, possibly emptier)
                                                                 │  effects via Broker; fuel/epoch bound
                                                                 ▼
                                                             EXECUTED
                                                                 │  emit run record on the hash chain
                                                                 ▼
                                                             AUDITED ──(may run again)──► RUNNABLE
                                             revoke / supersede │        │ purge
                                                                ▼        ▼
                                                            REVOKED   PURGED
```

### 3.2 Transition table

| From | Event | To | Guard |
|---|---|---|---|
| — | `author` | Authored | emitted as a Work Order deliverable; `producing_work_order_id` resolvable (ADR-0056) |
| Authored | `validate` | Validated | Wasm component valid; signature/hash verified via M9 chain; §5.4 checks pass; requests no ambient authority |
| Validated | `derive_grant` | Runnable | requested capabilities ⊆ `work_orders.capability_grant` of the producing Work Order; grant frozen (ADR-0054) |
| Validated | `derive_grant` (over-request) | **rejected → Authored** | a requested capability ∉ the Work Order's grant → hard refusal naming the offending capability (exit criterion) |
| Runnable | `run` | Executing | effective grant = frozen grant ∩ firm policy ∩ session grants is computed; Broker reachable |
| Executing | `effect` | Executing | `authorize_action` passes for that effect's class; fuel/epoch/memory within M9 caps |
| Executing | `complete` | Executed | run finished within caps; return value marshalled |
| Executing | `fuel_exhausted` \| `epoch_deadline` \| `memory_cap` | Executed(terminated) | M9 terminates the call with a typed error; partial effects already Broker-approved stand, nothing new dispatched |
| Executed | `audit` | Audited | run record emitted on the hash chain (ADR-0002) |
| Audited | `run` | Runnable → Executing | re-run recomputes the effective grant (frozen ∩ current firm policy) |
| Runnable \| Audited | `firm_capability_revoked` | Runnable | frozen grant unchanged; effective grant at next run is narrower (G6, G7) |
| any non-Executing | `revoke` \| `supersede` | Revoked | grant closed; artifact no longer runnable; history immutable |
| Revoked | `purge` | Purged | Wasm bytes removed; provenance and audit records retained (no hard delete of history) |

### 3.3 Grant-derivation sub-machine (ADR-0054, the heart of the milestone)

```
   requested_caps (declared in the artifact manifest)
        │
        ▼
   resolve producing Work Order ──► work_orders.capability_grant  (the ceiling)
        │
        ▼
   frozen_grant = requested_caps ∩ work_order.capability_grant
        │
        ├── requested_caps ⊄ work_order.capability_grant  ─────►  REFUSE (name the offending capability)
        │        (a capability requested but not held by the Work Order)
        ▼
   freeze frozen_grant  (immutable; ADR-0054)
        │
        ▼   at each run:
   effective_grant = frozen_grant ∩ firm_policy ∩ session_grants     (intersection, never union — security model §4)
        │
        ▼
   effective_grant ⊆ frozen_grant ⊆ work_order.capability_grant       (the invariant, transitively)
```

The refusal branch is not an error path bolted on; it is the exit criterion. A capability the Work Order did
not hold can never enter the frozen grant, so it can never enter the effective grant, so the Broker never sees
an authorised effect for it. The artifact is bounded *before* it can run, not policed *while* it runs.

### 3.4 Invariants

1. **No effect leaves the machine from any state but `Executing`, and only through the Broker.** An artifact in
   `Authored`/`Validated`/`Runnable`/`Executed`/`Audited` has no live Wasm instance and no reachable host
   function.
2. **`frozen_grant ⊆ producing_work_order.capability_grant` holds for the artifact's entire life.** The frozen
   grant is computed once and never widened. This is the property the exit criterion tests (AC3).
3. **`effective_grant ⊆ frozen_grant` holds at every run.** The run-time intersection with firm policy and
   session grants can only narrow. There is no code path that adds a capability at run time.
4. **A run without a resolvable producing Work Order is impossible.** Provenance is a precondition of `Runnable`
   (ADR-0056), so a grant without a source cannot exist.

---

## 4. Domain model

### 4.1 Core types

```
ArtifactId(String)              // an existing artifacts.id (ULID) — the executable artifact IS an artifact
WorkOrderId(String)             // the producing Work Order (M15) — provenance and grant source
EngagementId(String)            // resolved transitively via the Work Order (lineage)
ModuleHash(String)              // SHA-256 of the Wasm component bytes (M9 loading chain)
Capability(String)              // security-model grammar: domain "." action [":" scope]
ArtifactRunId(String)           // one execution
Fuel(u64)                       // M9 fuel budget — reused, not redefined
```

### 4.2 `ExecutableArtifact`

The executable artifact is an `artifacts` row (`/docs/04-database-design.md` §7) with an executable projection.
It adds nothing the `artifacts` table cannot express except *how to run it* and *where its authority comes
from*.

| Field | Type | Meaning |
|---|---|---|
| `artifact_id` | `ArtifactId` | FK to `artifacts` — the executable artifact is an artifact, not a parallel entity |
| `producing_work_order_id` | `WorkOrderId` | the Work Order that authored it — provenance and grant source (ADR-0056) |
| `module_hash` | `ModuleHash` | SHA-256 of the signed Wasm component; loaded through the M9 chain |
| `entrypoint` | `String` | the WIT-declared export invoked on run (e.g. `run`) |
| `requested_capabilities` | `Set<Capability>` | what the artifact declares it needs; the grant is ⊆ this ∩ Work Order grant |
| `limits` | `WasmLimits` | fuel, memory_mb, wall_ms — bounded by the M9 host defaults, never above them |
| `api_version` | `SemVer` | Sidra plugin API major (M9), for host compatibility |
| `signature` | `Signature` | Ed25519 over manifest + module hash (M9 chain, security model §8) |
| `status` | `ExecStatus` | Authored / Validated / Runnable / Executed / Audited / Revoked / Purged |

### 4.3 `ArtifactCapabilityGrant` — the bounding primitive

```
ArtifactCapabilityGrant {
    artifact_id:              ArtifactId,
    derived_from_work_order:  WorkOrderId,          // REQUIRED — the ceiling and the provenance (ADR-0056)
    frozen_grant:             Set<Capability>,      // = requested ∩ work_order.capability_grant, IMMUTABLE (ADR-0054)
    computed_at:              Timestamp,
    computed_by:              Actor,                // the kernel derivation, recorded
    revoked_at:               Option<Timestamp>,
}
```

`frozen_grant ⊆ derived_from_work_order.capability_grant` is a construction-time invariant, asserted in a
property test (§17 AC3). There is no setter that widens `frozen_grant`; the type exposes no mutator. Two Work
Orders authoring two artifacts produce two independent grants — an artifact's grant is never shared, pooled, or
inherited across Work Orders, for the same reason two departments needing one connector get two grants (M16
§4.4) and two departments needing one skill get two agent instances (`/docs-v2/02-layer-model.md` §4).

### 4.4 `ArtifactRun` — the audited execution

```
ArtifactRun {
    id:               ArtifactRunId,
    artifact_id:      ArtifactId,
    invoked_by:       Actor,                 // the agent/Work Order that triggered this run
    invoking_context: WorkOrderId,           // the run happens inside a Work Order (may differ from the producer)
    effective_grant:  Set<Capability>,       // frozen_grant ∩ firm_policy ∩ session_grants at run time
    fuel_used:        Fuel,
    wall_ms:          u64,
    outcome:          RunOutcome,            // ok | fuel_exhausted | epoch_deadline | memory_cap | denied | error
    effects:          [EffectRecord],        // every Broker verdict, secrets stripped
    at:               Timestamp,
}
```

Note `invoking_context` may differ from `producing_work_order_id`: an artifact authored by Work Order A can be
*run* inside Work Order B. This is the interesting case, and the model handles it plainly — the run's authority
is `frozen_grant` (bounded by **A**, the producer) intersected with firm policy, **not** widened by B's grant.
Running an artifact inside a more privileged Work Order does not lend it that privilege; the frozen grant is
the ceiling regardless of who runs it. This is what makes "cannot exceed the grant of the Work Order that
produced it" true even under reuse (F5).

### 4.5 Relationships (ASCII)

```
artifacts (M15)     1 ──── 0..1 ExecutableArtifact          (an artifact may be executable)
ExecutableArtifact  1 ──── 1    WorkOrderId (producer)       (provenance & grant source; ADR-0056)
ExecutableArtifact  1 ──── 1    ArtifactCapabilityGrant      (the frozen ⊆-Work-Order grant; ADR-0054)
ArtifactCapabilityGrant * ─── 1 WorkOrderId (ceiling)        (frozen_grant ⊆ its capability_grant)
ExecutableArtifact  1 ──── *    ArtifactRun                  (each execution, audited)
ArtifactRun         * ──── 1    WorkOrderId (invoking)        (the run happens inside some Work Order)
deliverables (M15)  1 ──── 1    artifacts                    (the existing provenance edge M20 reads)

  frozen_grant ⊆ producing_work_order.capability_grant       (INVARIANT — ADR-0054, tested)
  effective_grant ⊆ frozen_grant                             (INVARIANT — run-time intersection only narrows)
```

The provenance chain `ExecutableArtifact → producing Work Order → Engagement → agent` is not new plumbing: it
follows `deliverables.work_order_id` and `work_orders.engagement_id`, which already exist (`/docs/04-database-
design.md` §2). M20 records the producing Work Order directly on the executable artifact so grant derivation is
a single lookup, but the lineage it asserts is the one the schema already implies.

---

## 5. The artifact manifest and validation

### 5.1 Shape

An executable artifact carries a manifest analogous to the plugin manifest (`/docs/08-plugin-system.md` §3),
but its capability section is a *request*, not a grant — the grant is derived, not declared.

```toml
[artifact]
id            = "01J8...ULID"           # the artifacts.id this executable belongs to
name          = "csv-normaliser"
version       = "1.0.0"
api_version   = "1"                     # Sidra plugin API major (M9)
entrypoint    = "run"                   # WIT export

[provenance]
producing_work_order = "01J8...WO"      # REQUIRED — the grant source and lineage (ADR-0056)

[requested_capabilities]                # a REQUEST; the granted set is ⊆ this ∩ the Work Order's grant
caps = [
  "fs.read:vault/Sources/**",
  "fs.write:vault/Artifacts/**",
  "mem.read",
]
# NO net/host/credential appears here. External reach is via a granted connector only (§8, M16).

[limits]
fuel      = 50_000_000                   # ≤ the M9 host default; never above (ADR-0006, ADR-0055)
memory_mb = 64
wall_ms   = 10_000

[signature]
publisher = "sidra-firm"                 # signed via the M9 chain (security model §8)
```

### 5.2 The capability grammar is unchanged

An executable artifact's `requested_capabilities` use the existing security-model grammar verbatim
(`/docs/07-security-model.md` §4): `domain "." action [":" scope]`. There is no new namespace. `fs.read:...`,
`fs.write:...`, `mem.read`, `net.fetch:...` (only via a connector, §8), `tool.<name>` — all mean exactly what
they mean for an agent. This is deliberate: the grant is derived by *intersecting* the request with the Work
Order's `capability_grant`, which is a set of the same strings, so the two must speak one grammar.

### 5.3 The Work Order's say

The producing Work Order's `capability_grant` (`/docs/04-database-design.md` §2) is the ceiling. It is itself
already `charter ∩ work_order_grant ∩ firm_policy` (security model §4) — a Work Order can only narrow a
charter, never widen it. Because the artifact grant is ⊆ the Work Order grant, the artifact inherits that whole
chain of narrowing. An artifact can therefore never reach past the *charter* of the agent that authored it,
let alone past the firm policy — the ceiling is already the tightest of several.

### 5.4 Validation checks (hard refusal, no override)

Mirrors the plugin/connector install checks. Each failure names the rule.

1. Manifest schema valid; `api_version` major satisfied by the running M9 host.
2. Signature verified via the M9 plugin trust chain (ADR-0006), or developer mode explicitly enabled (v1 rules).
3. `module_hash` matches the signed Wasm bytes; the component is a valid WIT component with the declared
   `entrypoint` export.
4. **The component requests no ambient authority** — it imports only host functions from the M9 broker-mediated
   set (§8); it imports no filesystem, clock, network, socket, or randomness interface (ADR-0006, ADR-0055).
   A component importing anything outside the allowed WIT world is refused.
5. `[provenance].producing_work_order` resolves to an existing Work Order; without it the artifact cannot reach
   `Runnable` (ADR-0056).
6. **Every requested capability is a member of the producing Work Order's `capability_grant`.** A requested
   capability the Work Order did not hold is a hard refusal naming that capability — this is the exit criterion,
   enforced at validation *and* re-asserted at grant derivation (§3.3).
7. `[limits]` are all ≤ the M9 host defaults; a manifest requesting more fuel/memory/wall than the host permits
   is refused (the host caps it regardless, ADR-0006, but the manifest is refused for honesty).
8. No credential, token, or host appears in the manifest (redaction scan, security model §9); external reach is
   declared nowhere here — it is a connector grant on the Work Order's department (§8), not an artifact field.
9. `[requested_capabilities].caps` use only the security-model grammar; an unparseable capability is refused.

Checks 4 and 6 are the two that matter most: 4 keeps the sandbox a sandbox (no ambient authority), 6 keeps the
grant bounded (⊆ the Work Order). Both are CI gates (§14).

---

## 6. Component structure

```
                            ┌──────────────────────────────────────────────────────────┐
  agent, inside Work Order  │           sidra-artifacts-exec (kernel, Layer 1)          │
  authors a Wasm artifact   │                                                           │
  as a deliverable ────────►│  Authoring intake                                         │
                            │    │  1. record ExecutableArtifact + producing WO (prov)  │
                            │    ▼                                                       │
                            │  Validator ──► §5.4 checks (incl. no-ambient, ⊆-WO)        │
                            │    │                                                       │
                            │    ▼  2. derive_grant: frozen = requested ∩ WO.grant       │
                            │  GrantDeriver ──► ArtifactCapabilityGrant (frozen, ADR-0054)│
                            │    │                                                       │
  run(artifact, args) ─────►│  RunHost                                                  │
                            │    │  3. effective = frozen ∩ firm_policy ∩ session        │
                            │    ▼                                                       │
                            └────┼──────────────┬──────────────────────────┬────────────┘
                                 ▼              ▼                          ▼
                          sidra-plugins    PermissionBroker          (per effect, if external)
                          (M9 Wasm host)   (sidra-security)          M16 connector custody+egress
                          4. instantiate,  5. authorize_action        (only via a granted connector)
                             fuel/epoch/       per effect class            credential in keychain,
                             memory caps       (choke point)               host allowlist enforced
                                 │              │                          │
                                 └──────────────┴──────────────────────────┘
                                                ▼
                                        effect executed / denied
                                                ▼
                                        audited ArtifactRun + EffectRecord events (secrets stripped)
```

Internal modules of `sidra-artifacts-exec`:

| Module | Responsibility |
|---|---|
| `intake` | record an executable artifact and its `producing_work_order_id`; the provenance edge (ADR-0056) |
| `validate` | the §5.4 checks; the no-ambient-authority WIT-world check; the ⊆-Work-Order membership check |
| `grant` | derive `frozen_grant = requested ∩ work_order.capability_grant`; freeze it; refuse over-requests (ADR-0054) |
| `run` | the execution path: compute effective grant → instantiate via M9 → Broker per effect → collect run record |
| `host_fns` | the WIT host-function shims that route every artifact effect to the Broker (no new effect surface) |
| `audit` | emit `ArtifactRun` + `EffectRecord` events on the hash chain; strip secrets |
| `conformance` | the exit-criterion denial harness and the acceptance suite |

**Dependency direction (ADR-0011).** `packages/domain ← services/artifacts-exec ← apps/*`.
`services/artifacts-exec` depends on `services/plugins` (the M9 host), `services/security` (Broker, effect
classes, redaction), `services/store` (persistence), and — for the external-effect path only —
`services/connectors` (M16 custody/egress). It does **not** depend on `services/orchestrator` or
`services/mission`; the absence of that edge is a compile-time property enforced in CI, exactly as M16 and the
Mission Engine do it.

**Why it extends `services/plugins` rather than forking it.** ADR-0055: the sandbox is M9's. `artifacts-exec`
is a thin authority-and-provenance layer *over* the M9 host, not a second host. It calls `sidra-plugins` to
instantiate and run; it supplies the grant and the run record. Forking the host would create a second sandbox
to audit and a second place ambient authority could creep in — precisely the outcome ADR-0006 exists to
prevent.

---

## 7. Security

An executable artifact is code the Firm did not review, authored by a model, running next to the Principal's
encrypted life's work — the exact hazard ADR-0006 names. Every mitigation below is an application of an
existing M3/M9/M16 control, not a new one.

### 7.1 Threat table

| Threat (M3 §3) | How M20 addresses it |
|---|---|
| T5 malicious extension | The artifact is a signed Wasm component in the M9 sandbox (ADR-0006): deny-by-default, no ambient authority, fuel/memory/epoch capped. It can do only what its derived grant permits, and that grant is ⊆ the producing Work Order's grant. |
| T8 destructive action | Effects carry their class; a write is class-2 (versioned, undoable), an irreversible/external effect is class-3 and **always** asks (security model §5). An artifact cannot escalate a class — the class is a property of the operation, not the caller. |
| T2 exfiltration through a tool | An artifact has no raw network. External reach is only via a connector granted to its Work Order's department (M16), whose egress is host-allowlisted and payload-inspected (ADR-0036). A call from an artifact instantiated over untrusted content holds no class ≥1 tools (security model §7.3). |
| T3 key theft | The artifact's address space never receives a credential. If it reaches a connector, custody injects the secret at the egress boundary (ADR-0034); the artifact holds a placeholder, never the token. |
| **Autonomy escalation (M20-specific)** | The frozen grant is ⊆ the producing Work Order's grant by construction (ADR-0054). A capability the Work Order lacked can never enter the grant, so the Broker never authorises it. Proven by the exit-criterion denial test (AC3). |
| **Privilege lending via reuse (M20-specific)** | Running an artifact inside a more-privileged Work Order does not widen it: the run's authority is the frozen grant (bounded by the *producer*), not the invoker's grant (§4.4, F5). |
| **Autonomy on install (M20-specific)** | A Marketplace-distributed artifact arrives with no grant (§7.4). A grant exists only through a Work Order. Installation confers nothing — reconciles GUIDE §12. |
| T7 runaway spend | A run is a bounded tool call inside a Work Order; it inherits the Work Order's budget ceiling and the three nested budget ceilings (security model §7). Fuel/epoch bound CPU/wall independently. |

### 7.2 The single choke point holds

An artifact's effect is a tool call. It passes `PermissionBroker::authorize_action` under the operation's
effect class before anything happens. M20 adds two steps *ahead* of the Broker — grant derivation (is this
capability in the frozen grant?) and provenance resolution (does a producing Work Order exist?) — and one *at*
instantiation — the M9 no-ambient-authority WIT world. It removes none. There is no path from Wasm to an effect
that skips the Broker, because the M9 host exposes none and M20 adds no host function that is not a
Broker-mediated shim (§8).

### 7.3 No ambient authority (ADR-0006, ADR-0055)

The artifact's Wasm world imports **only** the M9 broker-mediated host functions. It imports no filesystem,
clock beyond coarse time, network, socket, or randomness beyond a seeded source — each is a capability routed
through the Broker or it does not exist. This is not a new rule; it is ADR-0006 applied to an agent-authored
guest instead of a human-authored one. Validation check #4 (§5.4) refuses any component that imports outside
the allowed world, and a CI test asserts the world contains no ambient interface (§14).

### 7.4 Reconciliation with "no artifact that arrives with autonomy" (GUIDE §12)

The permanent-no is explicit: *"No marketplace artifact that arrives with autonomy. Installation grants
nothing."* An executable artifact is reconciled with it exactly, not around it:

- **Installation/distribution grants nothing.** An executable artifact obtained from the Marketplace (Layer 8)
  or copied from another Vault arrives with **no** `ArtifactCapabilityGrant`. Its `requested_capabilities` are a
  request, not an authority. It is not `Runnable` until a grant is derived, and a grant can only be derived from
  a producing Work Order (§3.3, ADR-0056).
- **Authority comes only from a Work Order, and never exceeds it.** The bounded grant an executable artifact
  holds is derived from the Work Order that authored it (ADR-0054), inside the Firm, as a bounded subset. It is
  never conferred by the act of installing, and never larger than the Work Order held.
- **The distinction the guide protects is preserved.** The guide forbids *autonomy that arrives with an
  artifact*. M20 grants autonomy that is *authored inside the Firm's own delegation chain and bounded by it* —
  which is not the forbidden thing. A marketplace Pack still grants nothing on install; a plugin still grants
  nothing on install; an executable artifact still grants nothing on install. The rule stands, unpunctured.

---

## 8. Effects and host functions (no new effect surface)

The artifact's only bridge to the world is the M9 host-function set, unchanged from `/docs/08-plugin-system.md`
§5, each shim routing through the Broker:

| Host function | Effect class | Grant required | Mediation |
|---|---|---|---|
| `vault.read(path)` | 2 (local read within scope) / 0 if pure | `fs.read:vault/...` in the frozen grant | Broker; scope-checked against the grant |
| `vault.write(path, bytes)` | 2 (reversible, versioned) | `fs.write:vault/...` in the frozen grant | Broker; writes confined to Vault scope; versioned (never destructive) |
| `mem.search / mem.read` | 0 | `mem.read` in the frozen grant | Broker; namespace-scoped |
| `connector.invoke(id, op, params)` | 1 / 2 / 3 per the connector operation | `integration:<id>:<action>` in the frozen grant **and** a connector grant on the Work Order's department (M16) | Broker + M16 custody + egress; the artifact names no host and holds no credential |
| `kv_get / kv_put` | 0 | artifact-scoped KV namespace (M9) | Broker; namespaced, mediated by the kernel |
| `log` | 0 | — | redaction filter on write (security model §9) |

Notably absent, exactly as for plugins: raw filesystem, raw sockets, wall clock beyond coarse time, unseeded
randomness, process spawning. There is **no** `http_fetch` that names an arbitrary URL — outbound reach is
`connector.invoke` against a connector granted to the department, and the connector, not the artifact, declares
the host (ADR-0036). This is the join with M16: an executable artifact that needs to reach GitHub does so by
invoking the `github` connector's declared operation, which the M16 custody path credentials and the M16 egress
path allowlists. The artifact supplies parameters; it never supplies a scheme or host.

---

## 9. The run path and grant enforcement (ADR-0054 in mechanism)

On `run_artifact(artifact_id, invoking_work_order, args)`:

1. **Resolve state.** The artifact must be `Runnable` (or `Audited`, which re-enters `Runnable`). Any other
   state fails cleanly with a typed reason (invariant §3.4.1).
2. **Resolve provenance and frozen grant.** Load the `ArtifactCapabilityGrant`. Its `frozen_grant` is ⊆ the
   producing Work Order's `capability_grant` by construction (this was enforced at derivation; it is not
   re-derived here, it is read). If no grant exists, deny `no_grant` — an artifact with no producing Work Order
   is not runnable (ADR-0056).
3. **Compute the effective grant.** `effective = frozen_grant ∩ firm_policy ∩ session_grants` (security model
   §4, intersection never union). This can only narrow the frozen grant. A firm capability revoked since
   authoring is now absent from `effective` (G7, F3).
4. **Instantiate in the M9 host.** One Wasmtime instance for the run (M9 §5), fuel/epoch/memory caps applied
   from `[limits]` bounded by the host defaults. The WIT world is the no-ambient-authority world (§7.3).
5. **Per effect: the Broker.** Each host-function call the artifact makes carries the operation's effect class
   to `authorize_action`, checked against `effective`. A capability not in `effective` returns `fenced` to the
   artifact (which may handle it); a class-3 effect raises an Approval Request and suspends. The Broker is the
   choke point; steps 2–3 are pre-flight *ahead* of it.
6. **Bound and terminate.** Fuel exhaustion, the epoch deadline, or the memory cap terminates the call with a
   typed error (M9 §5); no further effect is dispatched. Effects already Broker-approved and executed stand
   (they were authorised); nothing new is authorised after termination.
7. **Audit.** Emit `ArtifactRun` with `effective_grant`, fuel/wall used, outcome, and one `EffectRecord` per
   Broker verdict, secrets stripped, on the hash chain (ADR-0002).

Steps 2–3 are the pre-flight M20 adds. Step 5 is the choke point that already existed. Step 4 is the sandbox
that already existed. No step is skippable and the order is fixed. The transitive invariant
`effective ⊆ frozen ⊆ producing_work_order.capability_grant` holds at every step, which is the exit criterion
stated as an assertion.

---

## 10. Effect classes (unchanged from the security model)

Each host-function invocation carries the effect class of the operation it performs; M20 enforces the existing
policy verbatim (security model §5).

| Class | Artifact meaning | Policy |
|---|---|---|
| 0 | pure/local read (`mem.search`, a scoped `vault.read` of already-permitted content, compute) | auto-allowed within the effective grant |
| 1 | external read via a connector (`connector.invoke` of a class-1 op) | host allowlist (M16); approval for a new host; archived to Sources; denied from an untrusted-content instantiation |
| 2 | reversible local write (`vault.write`) or reversible external write via a connector | auto-allowed in scope for local writes (versioned, undoable); approval-by-default for external writes |
| 3 | irreversible/external effect via a connector (delete outside Vault, send to a third party, spend, publish) | **always** an Approval Request; no standing grant; the run suspends on the Principal |

There is no way for an artifact to lower an operation's class: the class is a property of the host function and
the connector operation, declared in the manifest and validated at install (M16 §5.2), not a runtime argument
the artifact supplies. An artifact cannot "quietly" perform a class-3 effect as class-1.

---

## 11. Persistence, events, and the Markdown mirror

### 11.1 New tables — forward-only migrations, band `0039`–`0041`

The Mission (M15) migrations end at `0024`; the M16 connector migrations occupy `0025`–`0029`; M17–M19 are
reserved bands ahead of M20's `0039`–`0041`. M20 uses exactly three additive migrations.

| Migration | Table | Purpose |
|---|---|---|
| `0039_executable_artifacts.sql` | `executable_artifacts` | the executable projection of an `artifacts` row: `artifact_id` (FK), `producing_work_order_id` (FK, NOT NULL — provenance & grant source), `module_hash`, `entrypoint`, `requested_capabilities` (JSON), `limits` (JSON), `api_version`, `signature`, `status` |
| `0040_artifact_capability_grants.sql` | `artifact_capability_grants` | the ⊆-Work-Order grant: `artifact_id` (FK), `derived_from_work_order` (FK, NOT NULL), `frozen_grant` (JSON capability set), `computed_at`, `computed_by`, `revoked_at` |
| `0041_artifact_runs.sql` | `artifact_runs` | the run audit projection: `id`, `artifact_id` (FK), `invoked_by`, `invoking_work_order`, `effective_grant` (JSON), `fuel_used`, `wall_ms`, `outcome`, `effects` (JSON array of Broker verdicts, secrets stripped), `at` |

`executable_artifacts.producing_work_order_id` is `NOT NULL` with `ON DELETE RESTRICT` (design rule §7): the
provenance edge is structural, so an executable artifact whose producing Work Order was removed cannot exist,
and history is never rewritten. `artifact_capability_grants` has no column that can hold a widened grant — the
`frozen_grant` is written once at derivation. No existing column's meaning changes. A Firm with no executable
artifacts behaves exactly as it did before M20 — a null executable-artifact set is a fully supported state, not
a migration artifact (G10).

### 11.2 Domain events

Every event carries `actor`, `artifact_id`, and (where applicable) `producing_work_order_id`, and lands on the
hash chain (ADR-0002):

`ArtifactAuthored` · `ArtifactValidated` · `ArtifactValidationFailed` · `ArtifactGrantDerived` ·
`ArtifactGrantRefused` · `ArtifactRunStarted` · `ArtifactEffectAuthorized` · `ArtifactEffectDenied` ·
`ArtifactRunCompleted` · `ArtifactRunTerminated` · `ArtifactExecuted` · `ArtifactGrantRevoked` ·
`ArtifactSuperseded` · `ArtifactPurged`.

`ArtifactGrantRefused` is the exit-criterion event: it fires when a requested capability is not in the
producing Work Order's grant, naming the offending capability. `ArtifactEffectDenied` fires when a run attempts
an effect outside its effective grant. Both are audited, so a denial is evidence, not a silent nothing.

### 11.3 Vault Markdown mirror (v1 rule — the archive outlives the software)

```
~/Sidra/
└── artifacts/
    └── executable/
        └── csv-normaliser/
            ├── artifact.md      identity, version, module hash, producing Work Order — human-readable
            ├── grant.md         the frozen capability set and the Work Order it derives from — plain language
            └── runs/            per-day run log: effective grant, outcome, effects (secrets stripped)
```

Written on state transitions, not continuously. A Principal who abandons Sidra OS keeps a readable record of
every executable artifact, which Work Order authored it, exactly what it was permitted to do, and every effect
it ever had — but never a credential (those live in the keychain via M16 custody and are gone when the keychain
is) and never the executable bytes' authority (the grant is a bounded, readable list).

---

## 12. Public APIs

### 12.1 Commands

| Command | Effect | Notes |
|---|---|---|
| `author_executable_artifact(artifact_id, wasm, manifest, work_order)` | Authored | records provenance; refused if the producing Work Order is unresolvable (ADR-0056) |
| `validate_executable_artifact(artifact_id)` | Validated | runs §5.4 checks; hard refusal names the failing rule; no ambient authority (check #4) |
| `derive_artifact_grant(artifact_id)` | Runnable | `frozen = requested ∩ work_order.capability_grant`; **refused if any requested capability ∉ the Work Order grant**, naming it (ADR-0054, exit criterion) |
| `run_artifact(artifact_id, invoking_work_order, args)` → `RunResult` | Executed | the §9 path; returns `ok`/`fenced`/`needs_approval`/`terminated`; every effect via the Broker |
| `revoke_artifact_grant(artifact_id)` | Revoked | closes the grant; the artifact is no longer runnable; history immutable |
| `purge_executable_artifact(artifact_id)` | Purged | removes the Wasm bytes; retains provenance and audit records (no hard delete of history) |

### 12.2 Queries

| Query | Returns |
|---|---|
| `executable_artifact_status(artifact_id)` | lifecycle state |
| `artifact_grant(artifact_id)` | the frozen capability set and the Work Order it derives from |
| `artifact_lineage(artifact_id)` | producing Work Order → Engagement → agent (the provenance chain, ADR-0056) |
| `artifact_runs(artifact_id)` | run history with effective grant, outcome, and effects (secrets stripped) |

### 12.3 API rules

1. **No API widens a grant.** There is no command that adds a capability to a frozen grant. Widening the
   authority of an executable artifact is not expressible in the API surface (ADR-0054).
2. **Every effect goes through `run_artifact`, which goes through the Broker.** There is no side-door that
   executes an artifact's Wasm outside the run path.
3. **`derive_artifact_grant` is where over-request is refused**, structurally, before the artifact is runnable —
   naming the offending capability, with no override (the exit criterion).
4. **No API returns a credential**, and no run path exposes one to the artifact's address space (M16 custody,
   ADR-0034).

---

## 13. Sequence diagrams

### 13.1 Author → validate → derive grant → run (the bounded happy path)

```
Agent(WO_A)   ArtifactsExec   WorkOrders(M15)   M9 Host   Broker   Vault
   │ author(wasm, manifest, WO_A) │                 │        │        │
   ├─────────────────────────────►│ record provenance│        │        │
   │ validate                     │ §5.4 checks (no ambient auth)      │
   │ derive_grant                 │ load WO_A.capability_grant ───────►│
   │                              │◄── {fs.read:vault/Sources/**, fs.write:vault/Artifacts/**, mem.read}
   │                              │ frozen = requested ∩ WO_A.grant    │
   │                              │ (all requested ⊆ WO_A.grant → OK)  │
   │◄──── Runnable ───────────────┤ freeze grant                       │
   │ run_artifact(args)           │                 │        │        │
   ├─────────────────────────────►│ effective = frozen ∩ firm_policy   │
   │                              ├── instantiate ─►│ fuel/epoch/mem caps│
   │                              │   guest calls vault.read(Sources/x) │
   │                              ├── authorize_action(fs.read, class 2)►│ (in effective? yes)
   │                              │◄──────── Allow ─────────────────────┤
   │                              ├── vault.read ─────────────────────────────────►│
   │                              │◄──────────────── bytes ────────────────────────┤
   │◄──── result ─────────────────┤ audit ArtifactRun + EffectRecord (stripped)    │
```

### 13.2 The bounding refusal (the exit criterion)

```
Agent(WO_A)   ArtifactsExec   WorkOrders(M15)
   │ author(wasm, manifest requesting net.fetch:api.stripe.com) │
   ├───────────────────────────────►│ record provenance
   │ derive_grant                   │ load WO_A.capability_grant
   │                                │  WO_A.grant = {fs.read:vault/Sources/**, mem.read}
   │                                │  requested  = {fs.read:vault/Sources/**, net.fetch:api.stripe.com}
   │                                │  net.fetch:api.stripe.com ∉ WO_A.grant  →  REFUSE
   │◄── GrantRefused{net.fetch:api.stripe.com not in producing Work Order grant} ─┤
   │  (grant never frozen; artifact never Runnable; nothing instantiated; nothing dispatched)
   │  audit ArtifactGrantRefused (names the offending capability)
```

The artifact requested a capability its Work Order did not hold. The refusal is structural: the frozen grant is
never computed with it, so no run can ever exercise it, so the Broker never sees an authorised effect for it.
The artifact is bounded *before it can run*. This is AC3.

### 13.3 Reuse in a more-privileged Work Order does not lend privilege (F5)

```
Agent(WO_B, a higher grant)   ArtifactsExec
   │ run_artifact(artifact authored by WO_A, invoking=WO_B) │
   ├──────────────────────────────►│ load frozen_grant (derived from WO_A, the PRODUCER)
   │                               │ effective = frozen_grant ∩ firm_policy   ← NOT ∩ WO_B.grant
   │                               │ (WO_B's larger grant is irrelevant; the ceiling is WO_A's)
   │  guest attempts an effect in WO_B.grant but ∉ frozen_grant
   │◄── EffectDenied{fenced} ──────┤ audit ArtifactEffectDenied
   │  (the artifact cannot borrow WO_B's authority by being run inside it)
```

---

## 14. CI requirements

Two CI checks are non-negotiable gates for this milestone, mirroring the M16 conformance gates:

1. **Grant-subset property test (AC3).** Over a generated corpus of `(requested_capabilities, work_order_grant)`
   pairs, assert `derive_grant` produces `frozen ⊆ work_order_grant` in every case, and refuses (naming the
   capability) whenever `requested ⊄ work_order_grant`. The property `frozen ⊆ producing_work_order.capability_grant`
   must hold for every artifact the suite can construct. A build in which any derived grant exceeds its Work
   Order fails.
2. **No-ambient-authority test (AC5).** Assert that the WIT world an executable artifact is instantiated into
   contains no filesystem, clock (beyond coarse), network, socket, or randomness (beyond seeded) interface — and
   that a component importing any such interface is refused at validation (check #4). This is the ADR-0006
   sandbox property, asserted for the M20 guest world.

Plus the two structural checks inherited from the layer/dependency rules:

3. **Dependency-direction check.** `services/artifacts-exec` has no import edge to `services/orchestrator` or
   `services/mission`; the build fails on a hit (mirrors M16 AC12).
4. **No-new-host-function check.** The artifact host-function set is a subset of the M9 broker-mediated set; a
   host function that is not a Broker-routed shim fails the build (guards ADR-0055 — no new effect surface).

---

## 15. Performance and offline

- **A run is a bounded tool call.** Fuel metering caps CPU, the epoch deadline caps wall time, linear memory is
  capped — all from the M9 host (ADR-0006, §5), unchanged. An artifact cannot spin, allocate without bound, or
  wedge the process; exceeding any limit terminates the call with a typed error the invoking Work Order handles
  (§9.6).
- **No run blocks the Mission scheduler.** An artifact run is an effectful tool call dispatched within a Work
  Order. The Mission scheduler's determinism (M15) is unaffected because a run is just another tool with an
  effect class and a bounded budget — the same shape as a connector call (M16 §15).
- **Grant derivation is off the hot path.** The frozen grant is computed once, at authoring, and read at run.
  The run's only added work over a plain plugin call is one set-intersection (`frozen ∩ firm_policy ∩ session`),
  which is bounded by the grant's size (small).
- **Offline is the default-safe state.** An artifact whose only effects are local (Vault/memory/compute) runs
  fully offline — this is the common case. An artifact that reaches a connector degrades exactly as M16 does:
  the connector is `Unreachable`, that effect fails cleanly, and the run either handles the failure or
  terminates; local work continues (Layer-6/7 replaceability, `/docs-v2/02-layer-model.md` §9).

---

## 16. Failure scenarios

| # | Scenario | Handling |
|---|---|---|
| F1 | Artifact requests a capability beyond its Work Order's grant | `GrantRefused` at derivation, naming the capability; grant never frozen; artifact never `Runnable` (exit criterion, §13.2) |
| F2 | Running artifact attempts an effect outside its effective grant | `authorize_action` returns `fenced`; `ArtifactEffectDenied` audited; the artifact may handle the fence; nothing dispatched |
| F3 | A firm capability is revoked after the artifact was authored | `effective = frozen ∩ firm_policy` at the next run excludes it; the artifact is now narrower, with no code change (G7) |
| F4 | Fuel exhausted / epoch deadline / memory cap hit mid-run | M9 terminates the call with a typed error; already-approved effects stand; nothing new is dispatched or authorised (§9.6) |
| F5 | Artifact authored by WO_A is run inside a more-privileged WO_B | Authority is the frozen grant (bounded by WO_A); WO_B's grant is not intersected in; no privilege lent (§13.3) |
| F6 | Artifact outlives its Engagement | The grant is already frozen and bounded; run authority is frozen ∩ current firm policy; it cannot exceed what WO_A held, ever (§4.4) |
| F7 | Artifact tries to import a filesystem/socket/clock interface | Validation check #4 refuses the component; it never reaches `Validated`; the CI no-ambient-authority test guards the world (§14) |
| F8 | Artifact reaches an external host directly (no connector) | Impossible — there is no `http_fetch(url)` host function; outbound reach is `connector.invoke` against a granted connector only (§8) |
| F9 | Producing Work Order cannot be resolved | The artifact cannot reach `Runnable`; provenance is a precondition of a grant (ADR-0056); no run occurs |
| F10 | Distributed artifact run straight from the Marketplace | It arrives grant-less; not `Runnable` until a Work Order derives a bounded grant; installation confers nothing (§7.4, GUIDE §12) |

---

## 17. Acceptance criteria

The exit criterion decomposed into testable claims. **These are the contract with AntiGravity.**

| # | Claim | Proven by |
|---|---|---|
| AC1 | An agent-authored artifact executes in the M9 Wasm sandbox and returns a result | end-to-end run test: author → validate → derive grant → run → result (§13.1) |
| AC2 | Execution reuses the M9 host with no new sandbox: fuel/epoch/memory caps and no-ambient-authority apply unchanged | run test asserting the run uses `sidra-plugins`; the no-ambient-authority world test (AC5) |
| AC3 | **An executable artifact cannot exceed the grant of the Work Order that produced it** — a requested capability beyond the Work Order's grant is refused, structurally, before the artifact is runnable | the exit-criterion denial test (§13.2) asserting `GrantRefused` naming the capability, grant never frozen, nothing instantiated |
| AC4 | Every effect an artifact has passes the Permission Broker under the operation's effect class | run test asserting each effect emits a Broker verdict; a fenced capability returns `fenced`, a class-3 effect raises approval |
| AC5 | The artifact's Wasm world imports no filesystem, clock, network, socket, or randomness; a component importing one is refused | CI no-ambient-authority test + validation-check-#4 test over a corpus (ADR-0006, ADR-0055) |
| AC6 | `frozen ⊆ producing_work_order.capability_grant` holds for every artifact; `effective ⊆ frozen` holds at every run | grant-subset property test over a generated corpus (§14) |
| AC7 | Running an artifact inside a more-privileged Work Order does not widen its authority | reuse test: WO_A-authored artifact run in WO_B is bounded by WO_A's grant (§13.3, F5) |
| AC8 | A firm capability revoked after authoring is absent from the artifact's effective grant at the next run | revocation test asserting `effective` narrows with no artifact change (G7, F3) |
| AC9 | Fuel exhaustion / epoch deadline / memory cap terminates a run cleanly; already-approved effects stand, nothing new dispatched | resource-bound test forcing each limit (F4) |
| AC10 | External reach is only via a connector granted to the Work Order's department; the artifact holds no credential and names no host | connector-path test asserting custody injection at egress and no token in the artifact's address space (M16) |
| AC11 | A Marketplace-distributed artifact arrives grant-less and is not runnable until a Work Order derives a bounded grant | install-confers-nothing test (§7.4, GUIDE §12) |
| AC12 | Every author/validate/derive/run/deny/revoke is an audited event on the hash chain | `audit.verify` over an executable-artifact lifecycle fixture (AC per §11.2) |
| AC13 | `services/artifacts-exec` has no dependency edge to `services/orchestrator` or `services/mission`; host functions are a subset of the M9 set | dependency-direction + no-new-host-function CI checks (§14) |

---

## Appendix A — Glossary additions

- **Executable artifact** — an agent-authored `artifacts` row that is a signed Wasm component runnable in the
  M9 sandbox under a capability grant derived from, and bounded by, the Work Order that authored it. Not a new
  entity: an artifact plus an executable projection.
- **Producing Work Order** — the Work Order (M15) inside which an agent authored an executable artifact. Its
  `capability_grant` is the ceiling for the artifact's grant, and it is the root of the artifact's provenance.
- **Frozen grant** — the capability set computed once at authoring as `requested ∩ producing_work_order.capability_grant`,
  immutable thereafter. The bounding primitive (ADR-0054).
- **Effective grant** — `frozen ∩ firm_policy ∩ session_grants` at run time. Always ⊆ the frozen grant;
  computed per run so a later firm-policy narrowing applies automatically.
- **Provenance / lineage** — the recorded chain `executable artifact → producing Work Order → Engagement →
  agent`. The source of the grant, not decoration (ADR-0056).
- **Run record** — an audited `artifact_runs` row: one execution, its effective grant, its resource use, its
  outcome, and every Broker verdict, secrets stripped.

## Appendix B — Repository placement

```
services/
└── artifacts-exec/            NEW — crate sidra-artifacts-exec (thin authority layer over the M9 host)
    ├── intake                 record executable artifact + producing Work Order (provenance)
    ├── validate               §5.4 checks; no-ambient-authority WIT world; ⊆-Work-Order membership
    ├── grant                  derive & freeze the ⊆-Work-Order grant (ADR-0054)
    ├── run                    the execution path: effective grant → M9 instantiate → Broker → run record
    ├── host_fns               Broker-mediated host-function shims (no new effect surface)
    ├── audit                  ArtifactRun + EffectRecord events on the hash chain
    └── conformance            the exit-criterion denial harness + acceptance suite

services/plugins/              REUSED — the M9 Wasm host; not forked (ADR-0055)

services/store/migrations/     EXTENDED — 0039_executable_artifacts.sql, 0040_artifact_capability_grants.sql,
                                          0041_artifact_runs.sql (forward-only)

infrastructure/testing/
└── artifacts-exec/            NEW — grant-subset property test, no-ambient-authority test, bounding-refusal
                                     (exit criterion), reuse-does-not-lend-privilege, resource-bound, connector-path
```

Dependency direction (ADR-0011): `packages/domain ← services/artifacts-exec ← apps/*`.
`services/artifacts-exec` depends on `services/plugins`, `services/security`, `services/store`, and (for the
external-effect path) `services/connectors`; it does **not** depend on `services/orchestrator` or
`services/mission`.

## Appendix C — Implementation position

M20 is the **last** milestone of 2.5 "Field" (`/MILESTONE_REGISTRY.md` §3). It depends on M9 (the Wasm host and
trust chain) and M16 (the connector/capability machinery); both are Documented. It does **not** depend on M17,
M18, or M19 — the three intervening 2.5 milestones — which is why architecting M20 ahead of them is dependency-
correct, not a reordering (see `00-M19-AUDIT.md`). Building it before M16 would be the mistake ADR-0054 exists
to prevent: an executable grant derived before the per-department capability machinery existed would have
nothing to be a subset *of*, and an authority that already works is the change nobody bounds later.

**Exit criterion.** An agent-authored artifact executes, is capability-bounded, and cannot exceed the grant of
the Work Order that produced it — proven by a denial test, not by configuration (AC3).

**On completion, 2.5 "Field" is closed.** Do not begin M21 (3.0 "Chambers") until M20 is implemented,
integrated, and the capability-bounded-execution exit criterion is demonstrated.
