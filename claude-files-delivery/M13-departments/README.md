# M13 — Departments · Delivery Package

<<<<<<< HEAD
**Release 2.0 "Concourse" · the milestone M16 depends on · for AntiGravity**

Architecture and specification only — no production code. M13 makes departments real: the Pack format is
frozen, the seven CORE departments are authored as Packs, department rooms exist, Standards inherit, the
Registry query API and Canon promotion path work, and Applications (Layer 5) become a first-class record.
The Exchange carries real cross-department traffic for the first time.

## Exit criterion (authoritative, `docs-v2/02-implementation-changes.md` §M13)

> **Three departments installed from Packs, one Exchange request completing end to end.**

## What this milestone delivers

- Pack format frozen; local publisher; signing/verification reusing the v1 plugin trust chain.
- The seven CORE departments authored as Packs (`04-department-catalog.md`): Software Engineering, Backend,
  Frontend, AI Engineering, Cybersecurity, Product Design, UI/UX.
- Department rooms and the fixed panel set.
- Standards inheritance (firm > application > department) with conflict surfacing at install.
- Registry query API and Canon promotion path.
- Application records (Layer 5) as a first-class object.

## Why M16 needs this

M16's connector isolation (ADR-0035, AC2) requires the **Registrar to resolve an agent → its department**.
That resolver is delivered here. The verification audit found M16's connector code accepts the department as
a caller-supplied argument precisely because M13 did not exist. M13 closes that gap.

## Contents

| File | What |
|---|---|
| `ARCHITECTURE.md` | Departments architecture, 22-point, from `03-department-architecture.md` + `04-department-catalog.md` + `05-marketplace-and-packs.md` |
| `IMPLEMENTATION_PLAN.md` | Epics E1–E7, tasks, subtasks, AC, completion |
| `REVIEW_CHECKLIST.md` | The gate |
| `adr/ADR-REQUIREMENTS.md` | Governing ADRs (0013, 0014, 0016, 0017, 0020) — none re-decided |

## Governing ADRs (existing)

ADR-0013 (Pack), ADR-0014 (archetypes + lazy instantiation), ADR-0016 (Standards & Guards), ADR-0017
(Registries as Canon projections), ADR-0020 (fourth budget ceiling at the department).

**STOP after M14.**
=======
**For AntiGravity.** The complete architecture package for milestone M13 (Departments), release 2.0
"Concourse". Architecture and specification only — **no production code**, per the workflow.

## What this milestone delivers

The operational department layer: the kernel machinery that makes a Department **installable and
operational**. After M11 (invisible substrate) and M12 (visible Divisions and Offices), the Firm has a
skeleton with nothing doing delivery behind it. M13 delivers the four v2 kernel services that change that —
the **Registrar** (`sidra-departments`), the **Exchange** (contract-named cross-department requests), the
**Standards Engine**, and the **Guard Runner** — plus **Department Packs** as the unit of modularity, **Role
Archetypes with lazy instantiation**, **Standards & Guards as kernel primitives**, and **Registries as Canon
projections**.

It ships no more than the exit criterion requires: **three** departments, not twenty-one. Structure is earned
by evidence (Principle 13).

**Exit criterion:** **Three departments installed from Packs, and one Exchange request end to end** — proven by
test, not by configuration (`/MILESTONE_REGISTRY.md` §4).

## Contents

| File | What it is |
|---|---|
| `00-M12-AUDIT.md` | STEP 1 gate: confirms M12 (Structure) is architecturally complete; notes non-blocking metadata |
| `DEPARTMENTS_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0043-exchange-contract-resolution.md` | How the Registrar resolves a contract to a department when more than one provides it |
| `adr/0044-three-department-conformance-set.md` | Which three departments the exit-criterion test installs, and which contract the one request names |
| `IMPLEMENTATION_PLAN.md` | E1–E10, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The four decisions this milestone operationalizes, in one line each

1. **Packs as the unit of modularity (ADR-0013):** a department is a signed, versioned, installable Pack —
   `department.toml` plus twelve directories, nine of them pure data — validated by twelve mechanical install
   checks with no override.
2. **Archetypes & lazy instantiation (ADR-0014):** roles are templates (data in the Pack); the Registrar
   instantiates live agents on demand and retires them when idle, so the ≤400 MB idle budget survives.
3. **Standards & Guards as kernel primitives (ADR-0016):** a Standard is a path-scoped rule; a Guard is a
   lifecycle validator that can block; **every Standard ships a Guard or it does not ship.**
4. **Registries as Canon projections (ADR-0017):** department-owned, append-only fact namespaces, one owner
   per fact, contradictions blocked at authoring time, promotion to Canon a Principal Decision.

Two new ADRs (**0043**, **0044**) decide only what the sources leave open: how a contract resolves when more
than one department provides it, and which three departments the exit-criterion test installs.

## Reading order

1. `00-M12-AUDIT.md` — why it was safe to start M13
2. `DEPARTMENTS_ARCHITECTURE.md` — §1–§4 for the stance and model, then §5 (Registrar), §6 (Exchange), §7–§9
   (Standards/Guards, Registries, Archetypes)
3. The two ADRs — the decisions the sources did not already make
4. `IMPLEMENTATION_PLAN.md` — what to build, in order
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Copy the two ADRs to `docs-v2/adr/`, add rows to `docs-v2/adr/README.md`, mark `Accepted` on Principal
  approval. ADR numbering is contiguous across the M10–M14 packages (0038–0045); M13 holds 0043 and 0044.
- **Migrations occupy band `0011`–`0015`** (additive, forward-only). Do not use 0001–0010 (base/M11/M12) or
  0019+ (later milestones). Each migration ships with a fixture test from the previous release.
- **The Registrar (`sidra-departments`) is the substrate M16 grants against.** M16's connector isolation
  resolves the calling agent's department through `resolve_department` — M13 must land, integrate, and
  demonstrate its exit criterion before M16 is certifiable (`/MILESTONE_REGISTRY.md` §5, dependency 2).
- **The Guard-corpus CI gate goes live at M13** (`/MASTER_IMPLEMENTATION_GUIDE.md` §7): a Guard with no input
  it must block fails the build. So does the Pack-validation gate (any Pack failing the twelve checks) and the
  kernel-neutrality grep (any kernel crate naming a department).
- Two new crates — `sidra-departments`, `sidra-registry`; the Exchange extends `sidra-orchestrator`, the Guard
  Runner extends `sidra-security` (justified in `DEPARTMENTS_ARCHITECTURE.md` §Appendix B). Dependency
  direction is CI-enforced: neither new crate may import `sidra-orchestrator` or `sidra-mission`.
- On completion, the `MILESTONE_REGISTRY.md` M13 status is confirmed `Documented`; the number is permanent from
  that point (registry rule 4).

**Then STOP.** Per the workflow, **do not begin M14 until M13 is implemented, integrated, and the exit
criterion — three departments installed from Packs and one Exchange request end to end — is demonstrated.**
>>>>>>> dad9e9f9a86af49599cbd8fd2c8183ecc21dc8b7
