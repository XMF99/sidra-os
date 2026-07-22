# Sidra OS — Repository Implementation Roadmap (M1–M30)

**For AntiGravity.** The order to implement the architected milestones, the tracks that can run in parallel,
and the gate each milestone must pass before the next depends on it. This roadmap sequences *implementation*;
the architecture for every milestone is already complete (see `DELIVERY-INDEX.md`). It changes no architecture
and reverses no ADR.

| | |
|---|---|
| Governs | implementation order, not architecture |
| Source of truth for ordering | `MILESTONE-DEPENDENCY-MAP.md` (the edges) + `/MILESTONE_REGISTRY.md` §5 |
| Rule | a milestone is not "done" until its exit-criterion test is green to someone who does not trust you |

---

## 1. The standing gate (applies to every milestone)

Before any milestone that depends on M is started, M must satisfy — from the Master Guide's Definition of Done:

1. Its exit criterion is demonstrated live or in a recording.
2. Every effectful path has a test asserting its log entry.
3. The permanent CI gates are green (build, dependency-direction, generated-bindings, domain-purity,
   kernel-neutrality from M11, performance, audit-coverage, evaluation-sets, chaos, replay-equivalence from
   M11, pack-validation from M13, guard-corpus from M13).
4. Any ADR whose decision the milestone implements is `Accepted` and integrated into `docs-v2/adr/`.

**"Substantially done" is not a state.** A half-built persistence layer under a finished domain layer is half a
milestone, not most of one.

## 2. Current implementation state (observed in the repo)

- **Committed:** the v1 base schema (`V1`), M11–M13 migrations (`0002`–`0015`), `services/departments` +
  `services/registry` crates, the M16 connector crate (`services/connectors`, migrations `V25`–`V29`), M15
  Mission Engine domain layer (E1, ~3 of 113 tasks).
- **Documented but not implemented:** M10, M14, M17–M30, and the bulk of M15 (E2–E12).
- **Verification caveat:** no Rust toolchain has been available in prior audits, so committed code is
  `UNVERIFIED at the build level`. The first implementation act in any environment is to stand up the
  toolchain and run `cargo check/test/clippy/fmt` across the workspace.

## 3. Recommended implementation order

The architecture was written in registry order, but **implementation should follow the dependency edges, not
the milestone numbers**, and should close the earliest-incomplete milestone before building on it.

### Phase A — close the 1.0/2.0 substrate (highest priority)
The frontier of *implementation* is earlier than the frontier of *architecture*. Before any 2.5+ feature is
implemented, finish the substrate it assumes:

```
1. M10 hardening gates            → make the eight permanent CI gates real; second security review; 30-day dogfood
2. M11 → M12 → M13 finish         → migrations exist; complete the Registrar/Exchange/Standards/Guard behaviour + tests
3. M14 game studio/marketplace    → the Pack + distribution; uninstall-leaves-Firm-working
4. M15 mission engine E2–E12      → ~110 remaining tasks; migrations 0019–0024; the 3-dept/12-task/2-day exit test
5. M16 connector framework verify → its exit criterion needs the M13 Registrar to be real (STOP-2 in the M16 audit)
```
M16's isolation exit criterion is **blocked** until M13's Registrar resolves agent→department authoritatively —
so M13 must be genuinely complete, not just migrated, before M16 can be certified.

### Phase B — 2.5 "Field" (parallelisable once Phase A is green)
```
M17 connector suite   ── needs M16 certified
M18 companion         ── needs M10 (Brief) + M15 (Approval Requests); parallel to M17
   └ M19 voice        ── needs M18 + M6
M20 executable artifacts ── needs M9 + M16; parallel to M17/M18
```

### Phase C — 3.0 "Chambers"
```
M21 seats ──┬─ M22 separation of duties
            ├─ M23 kernel extraction ── M24 sync
            └─ M25 firm templates
```
M21 is the fan-in; do it first. M22/M23/M25 then run as parallel tracks; M24 follows M23.

### Phase D — 4.0 "Continuum"
```
M26 calibration ──┬─ M27 charter evolution
                  ├─ M28 procedural compilation
                  └─ M29 firm self-review
M30 continuum hardening ── after M26–M29
```
M26 is the fan-in (the measurement substrate); M27/M28/M29 are parallel; M30 is release hardening and must be
last — it proves no evolution path escalates without a Principal Decision, and needs all four loops present.

## 4. Parallel tracks (adjust headcount, not the edges)

| Track | Milestones | Runs parallel with |
|---|---|---|
| Kernel & storage | M2, M3, M11, M23 | — (everything depends on it) |
| Models & memory | M4, M5, M26 (calibration math) | each other after M3 |
| Orchestration & agents | M6, M7, M12, M15, M28 | — |
| Experience & clients | M1, M8, M18, M19 | most things, from M1 |
| Extensibility & integrations | M9, M13, M14, M16, M17, M20, M25 | after M7 |
| Identity & governance | M21, M22, M27, M29 | after M21 / M26 |

## 5. Migration application order

Apply forward-only in numeric order: `0001` (base) → `0002`–`0018` (M11–M14) → `0019`–`0024` (M15) →
`0025`–`0029` (M16) → `0030`–`0069` (M17–M29). `0031`–`0032` are unused (harmless gap). M30 adds none. Each
migration ships a test that runs it against a fixture Vault from the previous release.

## 6. The two rules about people, not code

1. **The team uses it daily from M6.** A product about delegation cannot be evaluated by people who have never
   delegated to it — the only instrument that detects "the organisation becomes the product" before a release.
2. **Whoever writes an ADR does not approve it.** Separation of powers applies to the humans building the
   system, not only to the agents inside it.
