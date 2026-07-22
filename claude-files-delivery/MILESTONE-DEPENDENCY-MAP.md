# Sidra OS — Milestone Dependency Map (M1–M30)

**What must exist before what.** Derived from `/MILESTONE_REGISTRY.md` §5 and each milestone's stated
dependencies. This is the ordering constraint, not a schedule; adjust headcount, never the edges. An edge
means the target genuinely cannot be built (or cannot pass its exit criterion) before the source.

---

## 1. The dependency graph

```
1.0 "Atrium"
  M1 shell ─► M2 vault/log ─► M3 security ─► M4 gateway ─► M6 orchestrator ─► M7 firm ─► M8 building ─► M10 hardening ═► 1.0
                    │            └► M5 memory ─┘                 │                  ▲
                    │                                            └► M9 plugins ─────┘
                    └────────────────────────────────────────────────────────────────────────────► (event log is the spine)

2.0 "Concourse"                     (1.0 in daily use)
  M10 ─► M11 dept substrate ─► M12 structure ─► M13 departments ─► M14 game studio/marketplace ═► 2.0
              │  (invisible; replay-equivalence gates everything after it)
              └─────────────────────────────► M15 mission engine   (needs the M11–M13 substrate)

2.5 "Field"
  M16 connector framework ◄── M13 (per-dept grants) + M9 (plugin host) + M3 (broker)
       └► M17 connector suite
  M18 companion ◄── M10 (Brief) + M15 (Approval Requests)
       └► M19 voice ◄── M18 + M6
  M20 executable artifacts ◄── M9 (Wasm host) + M16

3.0 "Chambers"
  M21 seats ◄── M2 (actor field) + ADR-0021
       ├► M22 separation of duties ◄── M21
       ├► M23 kernel extraction ◄── M11 (kernel-as-library) + M21
       │       └► M24 sync ◄── M23
       └► M25 firm templates ◄── M14 (marketplace) + M21

4.0 "Continuum"    (each gated by evaluation sets; propose, never enact)
  M26 outcome calibration ◄── M15 (mission outcome records)
       ├► M27 charter evolution ◄── M26 + M13
       ├► M28 procedural compilation ◄── M26 + M7
       └► M29 firm self-review ◄── M26 + M13
  M30 continuum hardening ◄── M26 + M27 + M28 + M29 ═► 4.0
```

## 2. Dependency table (direct predecessors)

| M | Milestone | Depends on | Nature of the dependency |
|---|---|---|---|
| M1 | Shell & skeleton | — | the workspace and CI baseline |
| M2 | Vault & event log | M1 | the append-only hash chain — the spine everything else derives from |
| M3 | Security kernel | M2 | the Permission Broker checks against logged state |
| M4 | Model gateway | M3 | routed calls pass the broker |
| M5 | Memory | M3 | retrieval needs the gateway interface, runs parallel to M4 |
| M6 | Orchestrator + agents | M4, M5 | a Directive needs models and memory |
| M7 | Full Firm + engines | M6 | the engines drive orchestrated agents |
| M8 | The building | M1 | the surface; visible late by design |
| M9 | Plugins | M7 | the capability surface lands inside the 2nd security review |
| M10 | Hardening & 1.0 | M1–M9 | proves the whole 1.0 substrate |
| M11 | Department substrate | M10 | boundaries added invisibly to the 1.0 Firm; **gates M12–M15** |
| M12 | Structure | M11 | visible Divisions/Offices over the invisible substrate |
| M13 | Departments | M11, M12 | installable departments with Registrar/Exchange |
| M14 | Game Studio & Marketplace | M13 | a department Pack + distribution |
| M15 | Mission Engine | M11, M12, M13 | Missions run across the department substrate |
| M16 | Connector Framework | M13, M9, M3 | per-department grants need departments; plugin trust; the broker |
| M17 | Connector Suite | M16 | five artifacts on the framework |
| M18 | Companion | M10, M15 | the Brief format and Approval Requests |
| M19 | Voice Directive | M18, M6 | a surface to speak into; the Directive pipeline |
| M20 | Executable Artifacts | M9, M16 | the Wasm sandbox; capability/grant machinery |
| M21 | Seats & Identity | M2, ADR-0021 | the actor field the chain has carried since 2.0 |
| M22 | Delegation & SoD | M21 | separation of duties between Seats |
| M23 | Kernel Extraction | M11, M21 | kernel-as-library; multi-client identity |
| M24 | Sync & Conflict Resolution | M23 | multi-device topology; the log as merge substrate |
| M25 | Firm Templates | M14, M21 | Marketplace distribution; seat-agnostic structure |
| M26 | Outcome Calibration | M15 | Mission outcome records to calibrate from |
| M27 | Charter Evolution | M26, M13 | measured performance; archetypes to evolve |
| M28 | Procedural Compilation | M26, M7 | observed procedures; the Workflow engine |
| M29 | Firm Self-Review | M13, M26 | departments to assess; measured overhead/quality |
| M30 | Continuum Hardening | M26–M29 | bounds and reviews every evolution path |

## 3. The load-bearing edges (the ones most likely to be argued with under schedule pressure)

1. **M11 gates M12–M15 absolutely.** Building visible structure before the invisible substrate ships an
   interface change before the replay-equivalence test exists to prove nothing else moved — the single mistake
   that turns the 2.0 migration into a rewrite.
2. **M16 cannot precede M13.** A connector granted before departments exist establishes a firm-wide
   permission, and a permission that already works is the change nobody makes later.
3. **M26 cannot precede M15.** Calibration needs outcome records — the plan-versus-reality data only concluded
   Missions produce. Without them, "the Firm learns" is the Firm adjusting numbers on the basis of nothing.
4. **M23 cannot precede M11.** Kernel extraction is the payoff of the kernel-as-library dependency direction
   (ADR-0011) that M11 realises; extracting before it means moving files, which the exit criterion forbids.
5. **M30 cannot precede M26–M29.** You cannot bound and security-review feedback loops that do not yet exist.

## 4. Critical path

```
M1 ─ M2 ─ M3 ─ M4 ─ M6 ─ M7 ─ M9 ─ M10 ─ M11 ─ M13 ─ M15 ─ M26 ─ {M27,M28,M29} ─ M30
                     │                    │      │
              (M5 ∥ M4)          (M12 before M13)  (M16 before M17/M20; M23 before M24)
```

The spine is the event log (M2). The two widest fan-outs are M11 (gates all of 2.0) and M26 (gates all of the
self-improvement loops). Everything in 2.5 and 3.0 branches off already-completed substrate and can proceed in
parallel tracks once its predecessors are green.
