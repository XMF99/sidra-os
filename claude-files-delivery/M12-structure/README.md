# M12 — Structure · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M12 (Structure), release 2.0 "Concourse".
Architecture and specification only — **no production code**, per the workflow.

## What this milestone delivers

The first *visible* enterprise structure. M11 shipped the invisible department substrate — the Firm running as
one implicit department with byte-identical behaviour. M12 makes the organisation legible: **eight Divisions**
between Kai and the departments (ADR-0012), **four Offices** holding firm-wide vetoes outside every delivery
line (ADR-0015), the **Rail showing Divisions**, and **vetoes working firm-wide**. It ships no department — the
member departments populate the Divisions in M13. It ships the Executive-Layer skeleton and the enforcement
that makes the vetoes real rather than drawn.

**Exit criterion:** eight Divisions, four Offices, the Rail shows Divisions, and a veto blocks firm-wide —
**proven by test, not by configuration.**

## Contents

| File | What it is |
|---|---|
| `00-M11-AUDIT.md` | STEP 1 gate: confirms M11 is architecturally complete, especially the replay-equivalence substrate M12 builds on |
| `STRUCTURE_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0042-firm-wide-veto-enforced-as-a-blocking-guard-at-the-choke-point.md` | The one new decision: how a firm-wide veto is enforced (operationalises ADR-0015) |
| `IMPLEMENTATION_PLAN.md` | E1–E7, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The decisions, in one line each

1. **Divisions between Executive and Departments (ADR-0012):** Kai supervises eight Divisions, never
   twenty-one departments; a Division routes and arbitrates and does no domain work; delegation depth rises to
   three and the fast-lane target to 65%.
2. **Offices hold vetoes; Departments hold delivery (ADR-0015):** four Offices — Quality, Cost, Architecture,
   Security — sit outside every delivery line, each holding a narrow firm-wide veto, each producing no
   Deliverable.
3. **Every executive holds exactly five tools (ADR-0004):** retrieve, delegate, convene, decide, report — the
   rule extends from Kai to every Division executive; a sixth tool fails the build.
4. **A firm-wide veto is a non-downgradable blocking Guard at the choke point (ADR-0042, new):** the Guard
   Runner blocks the effect; a Division executive cannot override; only the Principal can, and only for
   Security, as a Decision.

## Reading order

1. `00-M11-AUDIT.md` — why it was safe to start M12
2. `STRUCTURE_ARCHITECTURE.md` — §1–§3 for the stance and org model, then §5 (the veto) and §9 (failure mode 4)
3. `adr/0042…` — the one load-bearing new decision; the rest of M12 rides on ADRs 0012 / 0015 / 0004 / 0014
4. `IMPLEMENTATION_PLAN.md` — what to build, in order
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Copy the one new ADR to `docs-v2/adr/`, add its row to `docs-v2/adr/README.md`, mark `Accepted` on Principal
  approval. M12 is otherwise covered by existing accepted ADRs (0012, 0015, 0004, 0014) — no others are added.
- **Migrations occupy band `0007`–`0010`** (divisions, offices, veto records, division-executive rows),
  additive and forward-only. Do not use `0001` (M2 baseline), `0002`–`0006` (M11 substrate), or `0019+`
  (M15/M16).
- **M11 gates M12 absolutely** (`/MASTER_IMPLEMENTATION_GUIDE.md` §5). Confirm the replay-equivalence CI gate
  is green before demonstrating E7.
- On completion, update `MILESTONE_REGISTRY.md` M12 status per registry rule 4; the number is permanent from
  Documented onward.
- Dependency direction is CI-enforced: no new crate; the veto lives in `sidra-security`, the org graph in
  `sidra-departments`, and `packages/domain` gains no I/O edge.
- The five-tool executive check and the latency/token-budget gate (R-01) are new CI gates M12 adds.

**Then STOP.** Do not begin M13 until M12 is implemented, integrated, and the exit criterion is demonstrated.
</content>
