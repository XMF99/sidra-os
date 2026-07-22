# M24 — Sync and Conflict Resolution · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M24 (Sync and Conflict Resolution),
release 3.0 "Chambers". Architecture and specification only — **no production code**, per the workflow.

## What this milestone delivers

The merge substrate: the kernel machinery (`sidra-sync`) that lets two devices holding the same Vault diverge
offline and converge on one shared history — with **no event lost**, **no event rewritten**, and every genuine
disagreement about a mutable value surfaced to the Principal as a **Decision** rather than resolved behind
their back. It does **not** ship a first-party cloud (transports are folder-based or a self-hosted relay); it
ships the convergence itself, built on the append-only, hash-chained event log (ADR-0002) as the merge
substrate.

**Exit criterion:** two devices diverge offline and converge with no lost event and no silent overwrite;
conflicts surface as Decisions — proven by test, not by configuration.

## Contents

| File | What it is |
|---|---|
| `00-M23-AUDIT.md` | STEP 1 gate: confirms M23 is coherent as a dependency; notes the implement-after-M23 ordering constraint |
| `SYNC_AND_CONFLICT_RESOLUTION_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0064-convergence-merges-append-only-event-streams.md` | Convergence is a union of event streams under a deterministic total order; no event dropped |
| `adr/0065-projection-conflict-surfaces-as-a-decision.md` | A projection conflict becomes a Decision; never auto-resolved silently |
| `adr/0066-hash-chain-across-branches-reconciliation.md` | Per-device chains; a merge rewrites no event |
| `IMPLEMENTATION_PLAN.md` | E1–E7, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The three decisions, in one line each

1. **Union under a deterministic order (0064):** convergence unions two append-only per-device event streams
   and orders them by a key that is a pure function of the event set — so nothing is dropped and every device
   computes the same history.
2. **Conflict is a Decision (0065):** two concurrent writes to the same single-valued audit-bearing cell raise
   a `sync_conflicts` + `decisions` row for the Principal; last-writer-wins is never the default and never
   touches an audit-bearing cell.
3. **Per-device chain, no rewrite (0066):** each device signs and chains its own event stream; a merge inserts
   and orders, never renumbers or re-hashes — so every device's chain verifies independently, before and after
   every merge.

## Reading order

1. `00-M23-AUDIT.md` — why it was safe to architect M24, and the ordering constraint on *implementing* it
2. `SYNC_AND_CONFLICT_RESOLUTION_ARCHITECTURE.md` — §1–§5 for the stance and model, then the ADRs
3. The three ADRs — the load-bearing decisions
4. `IMPLEMENTATION_PLAN.md` — what to build, in order (E7 is the exit criterion)
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Copy the three ADRs to `docs-v2/adr/`, add rows to `docs-v2/adr/README.md`, mark `Accepted` on approval.
- Migrations begin at `0050_` (the 3.0 band); `0052_event_provenance.sql` is additive to `events` and must be
  a no-op transformation for a single-device Vault (AC12).
- On completion, update `MILESTONE_REGISTRY.md` M24 status `Defined → Documented`; the number is permanent
  from that point (registry rule 4).
- Dependency direction is CI-enforced: `sidra-sync` must not import `sidra-orchestrator` or `sidra-mission`.
- M24 depends on M23 (hosted topology) and M21 (Seats/device identity): implement only after both are in
  place — see `00-M23-AUDIT.md` §3.

**STOP — do not begin M25 until M24 is implemented, integrated, and the diverge-and-converge /
conflicts-as-Decisions exit criterion is demonstrated.** Do not begin M25 (Firm Templates and Portability)
until two devices are shown to diverge offline and converge with no lost event, no silent overwrite, and a
conflicting write producing a `decisions` row rather than an auto-resolution.
