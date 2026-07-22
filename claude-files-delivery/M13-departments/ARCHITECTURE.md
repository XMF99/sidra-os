# M13 — Departments · Architecture

**Release 2.0 "Concourse"**

| | |
|---|---|
| Milestone | M13 — Departments |
| Authoritative sources | `docs-v2/03-department-architecture.md`, `docs-v2/04-department-catalog.md`, `docs-v2/05-marketplace-and-packs.md` §2–§4, ADR-0013/0014/0016/0017/0020 |
| Exit criterion | Three departments installed from Packs; one Exchange request completing end to end |
| Principal-visible | Yes — new rooms appear, but only on explicit install (nothing arrives uninvited) |

> Compiles decided architecture into an implementable spec. Re-decides nothing. The Pack contract, the twelve
> checks, the catalogue, and the marketplace three-act install are fixed in the sources; this specifies how to
> build and ship them.

## 1. Overview

M11 built the substrate; M12 populated the org chart with empty groupings. M13 fills them with real,
installable departments. The Pack format is frozen, seven CORE departments are authored, and — for the first
time — the Exchange carries live cross-department traffic. This is where the isolation claims stop being tests
against a single implicit department and start being enforced across genuinely separate ones.

## 2. Architecture — from contract to installed department

The Department Pack contract (`03-department-architecture.md` §1–§2) is frozen at M13. A Pack is a signed,
versioned directory: `department.toml` + `roles/` + `playbooks/` + `standards/` + `guards/` + `registries/` +
`templates/` + `dashboards/` + `stage-model.yaml` + `evals/` + optional `tools/`. Nine of twelve directories
are data; only `tools/` runs code, in the existing Wasm sandbox.

**Install is three acts** (`05-marketplace-and-packs.md` §2), each logged and independently refusable:
1. **Acquire** — download + verify signature. Nothing loads.
2. **Install** — validate the twelve checks; resolve contracts; capabilities *requested*, displayed, not granted.
3. **Grant** — the Principal grants capabilities from a plain-language list, individually. Only now can the
   department act.

**The department lifecycle** (`03-department-architecture.md` §7): Proposed → Installed → Granted → Staffed →
Operating → Reviewed → (Quarantined) → Retired. Retirement never deletes; the namespace becomes read-only.

## 3. Domain model (additive to M11/M12)

```
Pack { manifest: DepartmentManifest, roles, playbooks, standards, guards, registries,
       templates, dashboards, stage_model, evals, tools?, signature, provenance? }
Application { id, owning_department_ids, stage, standards_profile, registries, dashboards, budget, engagement_history }  // Layer 5
StandardResolution { artifact_ref, applicable: [Standard], precedence: firm>application>department }
CanonCandidate { registry_entry_ref, referenced_across_applications: bool, proposed_by, confirmed_by? }
```

Applications are the join key between departments working on the same product
(`02-layer-model.md` §5): a record and a scope, never logic.

## 4. Services / crates

No new crate. Extensions:
- `sidra-departments` — Pack install (three acts), the twelve checks (frozen), lifecycle, **agent→department
  resolver** (the API M16 needs), Application records, autoscale for real departments.
- `sidra-registry` — Standards inheritance resolution (firm>app>dept) with install-time conflict surfacing;
  Registry query API; Canon promotion.
- `sidra-orchestrator` — the Exchange under real load (end-to-end `department.request`).
- shell — department rooms + the fixed panel set.
- `infrastructure` — local publisher; Pack signing/verification (reusing the v1 plugin trust chain).

## 5. Packages

`packages/domain` gains `Pack`, `Application`, `StandardResolution`, `CanonCandidate`. Seven Pack directories
are authored under `agents/departments/` (data, not a crate).

## 6. Events

Now firing under real load: `department.installed`, `agent.instantiated`, `standard.violated`,
`registry.entry_added`, `registry.entry_deprecated`, `exchange.requested`, `exchange.completed`. Application
creation is recorded. All defined in M11's schema; no new kind.

## 7. Database

New table `applications` was created at M11 (`0018_applications.sql`). M13 populates it and the
department/registry/exchange tables under real content. **No new migration is required** unless a Pack field
needs a column the M11 schema lacks — if so, add `0019_*` forward-only. Design intent: reuse M11's schema.

## 8. Migrations

**None expected.** (Schema shipped at M11.) Any genuinely missing column is `0019_*`, forward-only, additive.

## 9. ADRs

**No new ADR.** Governed by ADR-0013/0014/0016/0017/0020. See `adr/ADR-REQUIREMENTS.md`.

## 10. The seven CORE departments (authored as Packs, `04-department-catalog.md`)

Software Engineering (`dept.software-engineering`, head Vega), Backend (`dept.backend`), Frontend
(`dept.frontend`), AI Engineering (`dept.ai-engineering`, Orin's dept), Cybersecurity (`dept.cybersecurity`,
Corvus's dept), Product Design (`dept.product-design`, Iris's dept), UI/UX (`dept.ui-ux`, head Mira). Each
Pack's archetypes, playbooks, standards, registries, provides/requires contracts, KPIs, and effect ceiling
are specified per the catalogue and must be authored verbatim to those specs.

## 11–13. Epics / Tasks / Subtasks — see `IMPLEMENTATION_PLAN.md` (E1–E7).

## 14. Acceptance criteria

| # | AC | Verification |
|---|---|---|
| AC1 | The Pack format is frozen; a Pack installs via the three acts, each logged and independently refusable | install integration test |
| AC2 | The twelve validation checks pass on every authored Pack; each failure names its rule; no override | pack-validation CI over all seven |
| AC3 | **Three departments install from Packs** (e.g. Backend, Cybersecurity, UI/UX) and reach Operating | install test (exit criterion, part 1) |
| AC4 | **One Exchange request completes end to end** — e.g. Backend requests `capability.security-review` from Cybersecurity, charged to Backend's budget, with a resolved reviewer and a returned finding | Exchange integration test (exit criterion, part 2) |
| AC5 | Standards inherit firm > application > department; a conflict is surfaced **at install**, not at runtime | inheritance + conflict test |
| AC6 | The Registry query API returns append-only facts; a Canon candidate is promoted only by Kai-proposes / Principal-confirms | registry + Canon test |
| AC7 | An Application record joins departments working on one product; it holds no logic, only scope | application test |
| AC8 | **The Registrar resolves an agent → its department** via a stable API (the resolver M16 needs) | resolver unit test |
| AC9 | Uninstalling a department leaves the Firm functional and its artifacts + memory readable (I-17) | install/uninstall cycle |
| AC10 | A capability in a department's `[capabilities].forbidden` set cannot be granted, through any future approval | forbidden-scope test |
| AC11 | Nothing arrives uninvited: a room appears only on explicit install | UI test |
| AC12 | The replay suite stays green for the implicit-department corpus | replay green |

## 15. Review checklist — see `REVIEW_CHECKLIST.md`.

## 16. Exit criteria

**Three departments installed from Packs (AC3) + one Exchange request end to end (AC4)**, with the Pack format
frozen (AC1), the twelve checks green (AC2), and isolation proven by uninstall (AC9). The agent→department
resolver (AC8) is the specific deliverable M16 depends on.

## 17. Testing strategy

Pack validation over all seven CORE Packs. Exchange end-to-end integration (request → resolve → charge →
review → return). Standards inheritance + conflict-at-install. Registry append-only + Canon promotion.
Install/uninstall cycle (I-17). Isolation chaos across real departments. Replay suite continues.

## 18. CI changes

Add: pack-validation over the seven Packs (blocking), Exchange end-to-end job, standards-inheritance job,
install/uninstall (I-17) job. Replay + guard-corpus continue.

## 19. Workspace changes

None (no new crate). Seven Pack directories added under `agents/departments/` (data).

## 20. Repository structure

```
agents/departments/
├── software-engineering/   Pack (manifest, roles, playbooks, standards, registries, dashboards, evals)
├── backend/
├── frontend/
├── ai-engineering/
├── cybersecurity/
├── product-design/
└── ui-ux/
services/departments/       + three-act install, lifecycle, agent→department resolver, Applications
services/registry/          + standards inheritance, registry query API, Canon promotion
services/orchestrator/       + Exchange under real load
apps/desktop/                department rooms + fixed panel set
infrastructure/              local publisher + Pack signing/verification
```

## 21. Risks

| # | Risk | Mitigation |
|---|---|---|
| DR-1 | Uninstall leaves the Firm broken (the hardest claim) | I-17 install/uninstall cycle is blocking; namespace preserved read-only (Principle 3) |
| DR-2 | A CORE Pack authored differently from the catalogue | each Pack validated against `04-department-catalog.md` field-by-field in review |
| DR-3 | Standards conflict discovered at runtime, not install | conflict surfacing is an install check; runtime discovery is a defect |
| DR-4 | The agent→department resolver is inconsistent with M16's assumption | AC8 delivers the exact API M16's connector host calls; wire M16 to it during M16 integration |
| DR-5 | Exchange silently falls back to a general agent when a contract is unavailable | `contract_unavailable` is a clean failure surfaced to Kai — no silent fallback (§5) |

## 22. Implementation notes

Author the three departments needed for the exit criterion first (Backend, Cybersecurity, UI/UX) so the
Exchange end-to-end test — Backend → `capability.security-review` → Cybersecurity — is exercisable early. The
agent→department resolver (E1) is small but load-bearing for M16; ship it with a stable signature and a test
M16 can depend on. Keep uninstall (I-17) in view from the start: a department that cannot be cleanly removed
is a department that was not isolated, and that is the claim this milestone exists to prove.
