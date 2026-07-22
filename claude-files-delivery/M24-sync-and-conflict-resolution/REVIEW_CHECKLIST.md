# M24 Sync and Conflict Resolution — Review Checklist

**Gate before handoff to AntiGravity.** This confirms the architecture package is complete, internally
consistent, and ready to implement. It is a checklist for the architect (self-review) and the Principal
(approval), not for the implementer.

---

## 1. Documents complete

- [x] Architecture document — `SYNC_AND_CONFLICT_RESOLUTION_ARCHITECTURE.md` (why it exists, design goals,
      device/conflict lifecycles, domain model, the event log across devices, the sync protocol, persistence,
      conflict→Decision, the deterministic merge order, security, performance, sequence diagrams, failure
      scenarios, dependencies/risks, testing, CI, acceptance criteria, appendices)
- [x] Implementation plan — `IMPLEMENTATION_PLAN.md` (E1–E7, tasks with complexity, deps, files, AC, order)
- [x] Review checklist — this document
- [x] M23 audit (STEP 1 gate) — `00-M23-AUDIT.md`
- [x] Delivery index — `README.md`

## 2. ADRs complete

- [x] ADR-0064 — Convergence merges append-only event streams under a deterministic total order; no event dropped
- [x] ADR-0065 — A projection conflict surfaces as a Decision, never auto-resolved
- [x] ADR-0066 — The hash chain is preserved across branches by per-device provenance; a merge rewrites no event

Each follows the repo format (Context → Options → Decision → Consequences, with accepted / gained / reversal
cost). Numbering is consecutive from ADR-0064 and does not exceed 0066. Status is `Proposed`.

- [ ] **Integration action (AntiGravity):** copy the three ADRs into `docs-v2/adr/`, add their rows to
      `docs-v2/adr/README.md`, and mark them `Accepted` on Principal approval.

## 3. Dependencies verified

- [x] M23 (hosted topology / kernel extraction) — the substrate M24 converges *between*; see `00-M23-AUDIT.md`
- [x] M21 (Seats & device identity, ADR-0021) — a device belongs to a Seat; the actor field already on every
      event makes a merged event attributable with no chain rewrite
- [x] M2 (event log, ADR-0002) — the merge substrate: append-only, hash-chained, projections rebuildable
- [x] Decision Engine (`/docs/03-decision-engine.md`) — the destination of every conflict; `decisions`/`dissents`
      tables and the Boardroom/Archive/Inspector/Brief surfaces
- [x] M3 (security kernel) — Ed25519 device keypairs, redaction on every write path, the Broker command contract
- [x] Dependency direction preserved: `packages/domain ← services/sync ← apps/*`; **no** edge to
      `services/orchestrator` or `services/mission` (CI-enforced, AC14)

## 4. Consistency with authoritative sources

- [x] Consistent with **ADR-0002**: the event log is the source of truth and the merge substrate; convergence
      is a union of append-only events; nothing is edited, nothing deleted, corrections are new events
- [x] Consistent with the **projections model** (`/docs/04-database-design.md` §1): entity tables are
      projections rebuilt from the merged log; a projection has no history to overwrite
- [x] Consistent with the **Decision Engine** (`/docs/03-decision-engine.md`): a conflict is a first-class
      Decision with criteria, options, evidence, and supersession — never a chat message, never auto-resolved
- [x] Consistent with the **security model** (`/docs/07-security-model.md`): device auth via Ed25519 (§8),
      redaction on every write path (§9), the hash chain and `audit.verify` extended per device (§11), E2E over
      the transport (§10 stance preserved — a relay sees ciphertext)
- [x] Consistent with **scalability §4**: replicate the event log not the tables; events carry `(device, seq)`;
      transport is a plugin; the narrow UI-state LWW allowance is honored as a declared per-field policy only
- [x] Milestone numbering per `/MILESTONE_REGISTRY.md` (M24, 3.0 "Chambers"); migrations `0050`–`0053`; ADRs
      `0064`–`0066`
- [x] No existing architecture modified; no ADR decision reversed; no documentation duplicated. The one
      refinement (scalability §4 LWW → declared allowlist) is recorded in ADR-0065 and `00-M23-AUDIT.md` §2

## 5. Acceptance criteria complete

- [x] AC1–AC14 defined in the architecture §20 and each mapped to a task in E7 (or a prior epic's tests)
- [x] The exit criterion decomposes into: two devices diverge offline and converge (AC2); **no event lost —
      union proven** (AC3); **no silent overwrite — proven** (AC4); **conflicts surface as Decisions — proven
      by a conflicting-write test yielding a `decisions` row, not an auto-resolution** (AC5)
- [x] Every AC is testable and named; none relies on configuration or manual verification

## 6. Scope discipline

- [x] No production code in this package (architecture and plan only)
- [x] **No silent overwrite:** a fork on an audit-bearing cell always raises a Decision; the only silent path
      is the declared ephemeral allowlist (`ui_state`/`preferences`); the exit-criterion test proves it (AC4)
- [x] **Conflicts are Decisions:** a `sync_conflicts` row cannot exist without a linked `decisions` row
      (`decision_id` is required, §5.4, ADR-0065)
- [x] **No event lost, no event rewritten:** convergence is set union (AC3) and insert-only (AC7); a merge
      renumbers, re-hashes, or edits nothing (ADR-0066)
- [x] First-party cloud is **out of scope** (transports are folder-based or a self-hosted relay; scalability
      §4); a first-party cloud would need its own ADR
- [x] A single-device Firm is byte-identical to its pre-M24 self (AC12); M24 costs it nothing at runtime

## 7. Testing and CI

- [x] Property tests: merge is commutative and associative over event sets (AC6); union is lossless (AC3); no
      rewrite (AC7)
- [x] Chaos: diverge-and-converge over ≥3 devices, partition/heal, same-cell divergence → Decisions (AC8, AC11)
- [x] Adversarial: forged/tampered stream rejected at admission (AC9)
- [x] Equivalence: single-device byte-identical to pre-M24 (AC12)
- [x] CI gates named (§19): dependency direction, crate neutrality, audit coverage, no-silent-overwrite, merge
      algebra, chaos, chain integrity, single-device equivalence, forward-compat
- [x] The exit-criterion proof (T7.7) is the LAST epic's final task and the last thing to go green

## 8. Open items carried forward (non-blocking)

- [ ] M23 architecture is not yet written (`Defined`). M24's architecture depends on M23's exit criterion and
      substrate, not its document; **implementation** of M24 waits on M23 being architected and implemented
      (`00-M23-AUDIT.md` §3).
- [ ] M21 (Seats) is `Defined`; M24 uses its device/Seat identity. Confirm M21's device-identity surface at
      integration; the actor field it relies on already exists in the schema.
- [ ] On integration, update `/MILESTONE_REGISTRY.md` M24 status `Defined → Documented` (renumbering becomes
      forbidden at that point, per registry rule 4).

## 9. Ready for AntiGravity

- [x] Documents complete
- [x] ADRs complete (0064–0066)
- [x] Dependencies verified
- [x] Acceptance criteria complete
- [x] **Ready for implementation** once M23 is in place. Recommended start: E1 → E2 → E3, with E6 alongside.
      E7 (the diverge-and-converge / conflicts-as-Decisions proof) is the last thing to go green.

**STOP.** Per the workflow, do not continue to M25 until AntiGravity completes M24 implementation and
integration, and the diverge-and-converge / conflicts-as-Decisions exit criterion is demonstrated: two devices
diverge offline and converge with no lost event, no silent overwrite, and a conflicting write producing a
`decisions` row rather than an auto-resolution.
