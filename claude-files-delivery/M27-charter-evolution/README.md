# M27 — Charter Evolution · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M27 (Charter Evolution), release 4.0
"Continuum". Architecture and specification only — **no production code**, per the workflow.

## What this milestone delivers

The Layer-1 kernel machinery (`sidra-evolution`) that lets the Firm turn an observed performance shortfall into
a *proposed* charter revision for a Role Archetype — motivated by M26's outcome records, gated by the
archetype's own evaluation set, refused at the gate if it regresses or widens authority, and merged only when
the Principal confirms it as a Decision on the record. **The Firm proposes; the eval set gates; the Principal
confirms.** It ships no charter change of its own and grants the Firm no power to write a charter version — the
engine's one new power is to *ask*.

**Exit criterion:** a proposed charter revision that regresses its evaluation set is refused; an accepted one is
a Decision the Principal confirmed — proven by test, not by configuration.

## Contents

| File | What it is |
|---|---|
| `00-M26-AUDIT.md` | STEP 1 gate: confirms M26's registry-pinned contract is fixed enough to architect against; records the D-1 implementation-sequencing constraint |
| `CHARTER_EVOLUTION_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0072-regressing-revision-refused-acceptance-is-a-principal-decision.md` | The regress gate is mechanical and first; acceptance is the only version-writer, a Principal Decision |
| `adr/0073-evaluation-set-is-the-versioned-merge-gate-proposer-is-never-reviewer.md` | The eval set is the archetype's versioned, fail-closed merge gate; the proposer is never the reviewer |
| `IMPLEMENTATION_PLAN.md` | E1–E6, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The two decisions, in one line each

1. **Regress-refused + accept-is-a-Decision (0072):** a revision that scores below baseline or widens authority
   is refused at a mechanical gate *before* any Principal involvement, and the only writer of a charter version
   is `confirm_revision`, which requires a Principal Seat actor and a Decision id — the Firm never promotes
   itself.
2. **The versioned eval set is the gate; proposer ≠ reviewer (0073):** an evaluation set is attached one-to-one
   to an archetype and versioned, is the sole merge gate (a missing set fails closed), baseline and candidate
   run on the *same* eval-set version, and the archetype under revision can neither author its gate nor confirm
   its own revision.

## Reading order

1. `00-M26-AUDIT.md` — why it was safe to start M27, and the D-1 constraint that bounds implementation
2. `CHARTER_EVOLUTION_ARCHITECTURE.md` — §1–§4 for the stance, the lifecycle, and the model, then §8–§10 for
   the gate and the propose→confirm path, then the ADRs
3. The two ADRs — the load-bearing decisions
4. `IMPLEMENTATION_PLAN.md` — what to build, in order
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- **D-1 first.** M27 *implementation* is gated on M26 being Documented and its outcome-record read surface
  (`sidra-calibration`) existing. E2 wires evaluation-run scoring and provenance against the M26 registry-pinned
  contract behind one module until then — a wiring concern, not a redesign (`00-M26-AUDIT.md`; architecture
  §16.1).
- Copy the two ADRs to `docs-v2/adr/`, add rows to `docs-v2/adr/README.md`, mark `Accepted` on approval.
  Recommended in the same pass: promote ADR-0033 `Proposed → Accepted`, since M27 makes it load-bearing at a
  second site.
- Migrations begin at `0061_` (M25 migrations end at `0060_`): `0061_charter_revisions.sql`,
  `0062_evaluation_sets.sql`, `0063_evaluation_runs.sql`, all forward-only.
- **Propose, never enact.** The engine has no write edge to `agent_versions` outside `confirm`; `confirm`
  requires a Principal Decision id. Both absences are CI-enforced (AC7, AC12).
- **Local only (ADR-0009).** Evaluation runs use local models over a local corpus; no score, ranking, or
  revision leaves the machine — CI asserts a full run completes network-denied (AC10).
- Dependency direction is CI-enforced: `sidra-evolution` must not import `sidra-orchestrator` or
  `sidra-mission`.

**STOP — do not begin M28 until M27 is implemented, integrated, and the exit criterion is demonstrated.**
