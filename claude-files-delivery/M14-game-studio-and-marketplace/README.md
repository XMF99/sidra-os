# M14 — Game Studio and Marketplace · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M14 (Game Studio and Marketplace),
release 2.0 "Concourse". Architecture and specification only — **no production code**, per the workflow.

## What this milestone delivers

The final milestone of 2.0. Two things that are one thing:

1. **The Game Studio** — `dept.game-development`, the largest department in the catalogue, compiled from
   `Claude-Code-Game-Studios` (CCGS, MIT) into a **Department Pack**: 49 Role Archetypes, 73 Playbooks, 11
   Standards, 12 Guards, 2 Registries, 38 templates, a seven-stage Stage Model. It is **not** embedded code
   and the kernel does **not** special-case it — that is the whole point of ADR-0019
   (`/docs-v2/adr/0019-compile-ccgs-do-not-embed.md`).
2. **The Marketplace** — Layer 8 distribution: how a Pack is published, discovered, acquired, and installed,
   reusing M13's install machinery. **Distribution is not authority** (`/docs-v2/02-layer-model.md` §8).

The Game Studio is the proof the Department Pack contract is real: a department this idiosyncratic —
seven lifecycle stages, forty-nine roles, three target engines, its own review culture — must fit inside the
contract **without special-casing the kernel** (`/docs-v2/02-game-studio-department.md` intro). The
Marketplace is the proof a Pack can be distributed, installed, work, and **uninstalled cleanly**.

**2.0 "Concourse" ships at the end of this milestone** (`/MILESTONE_REGISTRY.md` §2, 2.0 row).

**Exit criterion:** **the nine-item acceptance list, including uninstall-leaves-Firm-working**
(`/MILESTONE_REGISTRY.md` M14 row; `/MASTER_IMPLEMENTATION_GUIDE.md` §5 M14 row). Items 1–6 are the Game
Studio integration acceptance reproduced from `/docs-v2/03-integration-plan.md` §9; items 7–9 are the
Marketplace distribution acceptance drawn from `/docs-v2/05-marketplace-and-packs.md` §2/§6 and
`/docs-v2/02-layer-model.md` §8. Item 6 — **uninstalling the Pack leaves the Firm functional and the
Artifacts and memory intact** — is the headline: the Layer-3 replaceability proof.

## Contents

| File | What it is |
|---|---|
| `00-M13-AUDIT.md` | STEP 1 gate: confirms M13 (Departments) is architecturally complete — the Pack install machinery and Registrar that M14 builds on |
| `GAME_STUDIO_AND_MARKETPLACE_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0045-marketplace-is-distribution-only.md` | The Marketplace reuses the M13 install path; it adds no install mechanism and no trust mechanism |
| `IMPLEMENTATION_PLAN.md` | E1–E8, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The two decisions, in one line each

1. **Compile, don't embed (ADR-0019):** CCGS is transformed into Sidra structures by a maintained compiler
   in `infrastructure/scripts/ccgs-compile/`, with `derived_from` provenance per artifact; the Game Studio is
   a Department Pack like every other, subject to the same isolation, capability model, and audit chain — **no
   second runtime, no ambient shell, no special case in the kernel**.
2. **Review Intensity as a firm-wide setting (ADR-0018):** three modes (`full` / `standard` / `lean`) change
   *how much* optional review runs, never *whether* — `author ≠ reviewer` (ADR-0008) is absolute in every
   mode, including `lean`, and Security Office / class-3 review is exempt from the dial entirely.

One new decision this package proposes: **ADR-0045 (Proposed)** — the Marketplace is distribution-only. It
delivers and proves-who-signed an artifact and reuses M13's twelve install checks; it never becomes a second
install path or a second trust mechanism, which is what keeps Layer 8 replaceable
(`/docs-v2/02-layer-model.md` §9).

## Reading order

1. `00-M13-AUDIT.md` — why it was safe to start M14
2. `GAME_STUDIO_AND_MARKETPLACE_ARCHITECTURE.md` — §1–§5 for the stance, model, and the Marketplace, then §11
3. `adr/0045-marketplace-is-distribution-only.md` — the one load-bearing new decision
4. The two governing ADRs already in the repo — 0018 (Review Intensity) and 0019 (compile-don't-embed)
5. `IMPLEMENTATION_PLAN.md` — what to build, in order
6. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Copy ADR-0045 to `docs-v2/adr/`, add its row to `docs-v2/adr/README.md`, mark `Accepted` on approval.
- **Migrations occupy band `0016`–`0018`** (additive, forward-only, idempotent) — the band assigned to M14,
  after the department-substrate migrations (M11–M13) and before the Mission Engine's (M15). Do not use
  `0001`–`0015` or `0019`+.
- **CCGS is MIT.** The Pack ships `PROVENANCE.md` (source repository, author, license, source commit, import
  date), retains the MIT license text, states its origin as the **first line** of the listing description, and
  carries `derived_from` on every compiled artifact (`/docs-v2/03-integration-plan.md` §7). This is a
  **mechanical install-check requirement**, not a courtesy — a Pack missing it does not install (see the
  architecture §7 and AC-L1).
- The Game Studio is a **Department Pack installed through the M13 machinery** (Registrar + the twelve install
  checks in `/docs-v2/03-department-architecture.md` §8) and distributed through the Marketplace. It is
  **not** a new kernel crate — the kernel must not special-case it (invariant, `/MASTER_IMPLEMENTATION_GUIDE.md`
  §3.12, CI grep).
- On completion, update `MILESTONE_REGISTRY.md`/`MASTER_IMPLEMENTATION_GUIDE.md` M14 status — it is already
  `Documented`; the number is permanent from that point (registry rule 4). **2.0 "Concourse" ships here.**

**STOP — do not begin M15 preparation from here; per the mission, M10–M14 is the scope. Do not begin M17.**
Note that M15 (Mission Engine) is already `Documented · Open` in the registry, so no architecture work on it
is owed from this package. This delivery **completes the M10–M14 backfill; await Principal approval** before
any further milestone work.
