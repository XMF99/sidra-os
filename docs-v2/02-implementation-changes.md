# Implementation Changes

Deltas to `/docs/06-implementation/01-implementation-plan.md`, `/docs/02-architecture/04-database-design.md`,
`/docs/02-architecture/03-folder-structure.md`, and `/docs/06-implementation/02-testing-and-quality.md`.

**M1–M10 are unchanged.** They describe the path to 1.0 and v2 does not touch them. The enterprise work is
M11–M14 and begins after 1.0 ships.

## 1. New milestones

### M11 — Department substrate

*Exit criterion: the Firm runs as one implicit department containing the v1 agents, with byte-identical
behaviour.*

- `sidra-departments` crate: manifest parsing, validation (the twelve checks), the org graph, archetype
  resolution, instance lifecycle, autoscale.
- `sidra-registry` crate: Standards resolution by path and type, registry storage and query, violation
  recording.
- Guard Runner in `sidra-security`: lifecycle points, declarative guard evaluation, Wasm validator interface.
- Exchange in `sidra-orchestrator`: `department.request` routing, contract resolution, cost attribution,
  depth and cycle enforcement.
- Schema additions (§3). Four new event kinds.
- **The replay acceptance test from `01-migration-strategy.md` §6 runs green in CI.**

Nothing is visible to the Principal at the end of M11. That is the exit criterion, not a shortcoming.

### M12 — Structure

*Exit criterion: eight Divisions and four Offices exist; the Rail shows Divisions; vetoes work firm-wide.*

- Division and Office concepts in the org graph.
- Kai's routing extended to Divisions; fast-lane bypass preserved and measured against the 65% target.
- Office reviewer instances; the `reviewer_division != author_division` rule for Office reviews.
- Rail, keymap, and palette scope changes. DivisionBoard and DepartmentCard components.
- The v1 → v2 manifest generator, presented as a Decision.
- Per-department budget sub-ceiling in the Model Gateway.

### M13 — Departments

*Exit criterion: three departments installed from Packs, one Exchange request completing end to end.*

- Pack format frozen. Local publisher. Signing and verification reusing the v1 plugin trust chain.
- The seven CORE departments authored as Packs.
- Department rooms and the fixed panel set.
- Standards inheritance (firm > application > department) and conflict surfacing at install.
- Registry query API and Canon promotion path.
- Application records (layer 5) as a first-class object.

### M14 — Game Studio and Marketplace

*Exit criterion: the acceptance list in `03-game-studio/03-integration-plan.md` §9.*

- The CCGS compiler in `infrastructure/scripts/`.
- Phases P0–P8 of the integration plan.
- Marketplace surface with an empty catalogue, trust tiers, and the three-act install.
- Review Intensity as a firm-wide setting.

## 2. Milestone dependencies

```
M1 … M10  ──▶ 1.0 "Atrium" ships
                    │
                    ▼
                  M11 substrate ──▶ M12 structure ──▶ M13 departments ──▶ M14 studio + marketplace
                    │                                        │
                    └── replay test green ───────────────────┴──▶ 2.0 "Concourse"
```

M11 gates everything. Building M12's visible structure before M11's invisible substrate would mean shipping
an interface change before the equivalence test exists to prove it changed nothing else — which is the
ordering mistake that turns a migration into a rewrite.

## 3. Database changes

All additive. `/docs/02-architecture/04-database-design.md` remains authoritative for everything existing.

**New tables:**

| Table | Purpose |
|---|---|
| `departments` | Installed Packs: id, division, version, manifest hash, state, budget share, install timestamp |
| `role_archetypes` | Declared roles per department, with version and evaluation-set reference |
| `standards` | Resolved standards: id, scope glob, department, inheritance source, version |
| `registry_entries` | Registry facts: namespace, key, value, owner, status, revised, referenced_by |
| `guards` | Declared guards: id, lifecycle point, action, department |
| `guard_violations` | Recorded violations: guard, agent, work order, timestamp, resolution |
| `applications` | Layer 5 records: id, owning departments, stage, standards profile |
| `exchange_requests` | Cross-department requests: from, to_contract, resolved_to, budget, state |

**Additive columns (all nullable, all with v1-equivalent defaults):**

| Table | Column | v1 behaviour when null |
|---|---|---|
| `agents` | `department_id`, `archetype_id`, `archetype_version`, `instance_number` | The implicit department |
| `work_orders` | `department_id`, `application_id` | Unscoped, exactly as v1 |
| `engagements` | `division_id`, `application_id` | Unscoped |
| `deliverables` | `department_id` | Unscoped |
| `budgets` | `department_id` | The three v1 ceilings apply unchanged |
| `memory_chunks` | `namespace` | Global namespace = v1 behaviour |

**New event kinds:** `department.installed`, `department.retired`, `agent.instantiated`, `agent.retired`,
`standard.violated`, `guard.blocked`, `registry.entry_added`, `registry.entry_deprecated`,
`exchange.requested`, `exchange.completed`, `office.vetoed`.

**New message kinds:** `department.request`, `standard.violation` — twelve become fourteen (ADR-0016).

**Migration files:** `0012_departments.sql` through `0018_applications.sql`. Forward-only, idempotent, each
independently deployable, none touching an existing column.

## 4. Folder structure changes

Extends ADR-0011. The seven top-level directories are unchanged.

```
agents/
├── firm.toml                      # now declares divisions and offices
├── charters/                      # the 13 named agents (11 v1 + Corvus + Lyra)
├── departments/                   # NEW — one directory per Department Pack
│   ├── software-engineering/
│   ├── backend/
│   ├── frontend/
│   ├── ai-engineering/
│   ├── cybersecurity/
│   ├── product-design/
│   ├── ui-ux/
│   └── game-development/          # the compiled CCGS Pack
├── offices/                       # NEW — Quality, Cost, Architecture, Security charters
├── playbooks/                     # firm-wide only; department playbooks live in their Pack
├── standards/                     # NEW — firm-wide standards only
├── workflows/
├── prompts/
└── evals/                         # firm-wide; department evals live in their Pack

services/
├── departments/                   # NEW — sidra-departments
├── registry/                      # NEW — sidra-registry
└── …                              # eleven existing crates unchanged

infrastructure/
└── scripts/
    └── ccgs-compile/              # NEW — the CCGS importer, maintained
```

Every department is self-contained in one directory, which is the filesystem expression of Principle 11. A
reviewer can read `agents/departments/backend/` and know everything Backend can do.

## 5. Testing changes

Extends `/docs/06-implementation/02-testing-and-quality.md`. The existing invariants are unchanged.

**New invariants:**

| # | Invariant | Test |
|---|---|---|
| I-12 | An agent never writes outside its department's filesystem scope | Property test: random Work Orders across departments; assert no cross-scope write |
| I-13 | An agent never reads another department's memory namespace without a granted, scoped, expiring read | Property test against the memory service |
| I-14 | A department's spend never exceeds its sub-ceiling | Property test: budget exhaustion pauses one department, Firm continues |
| I-15 | The Exchange refuses cycles and depth > 2 | Unit test on the request graph |
| I-16 | An Office review's author and reviewer are never in the same Division | Assertion in the orchestrator, tested |
| I-17 | Uninstalling a department leaves the Firm functional and its artifacts readable | Integration test, full install/uninstall cycle |

**New suites:**

- **Replay equivalence** — the acceptance test from `01-migration-strategy.md` §6, on a corpus of recorded
  v1 Engagements. Runs on every commit to M11–M14.
- **Pack validation** — every Pack in the repository passes the twelve checks in CI.
- **Guard corpus** — each Guard has at least one input it must block and one it must pass. A Guard with no
  blocking test is a Guard nobody has verified fires.
- **Department evaluation sets** — per-department, gating charter changes. Same rule as v1: an archetype
  change that regresses its evaluation set does not merge.
- **Isolation chaos** — kill a department mid-Work-Order and assert neighbours are unaffected and the Work
  Order resumes. Extends v1's chaos suite, which already kills the process at every state transition.

**Performance gates.** The v1 budgets hold and are re-verified with twenty-one departments installed and
sixty agent instances live. Cold start ≤1.2 s, 60 fps, idle ≤400 MB. The idle budget is the one at risk;
lazy instantiation (ADR-0014) is what protects it, and if that budget is exceeded the correct response is to
instantiate less, not to raise the number.

## 6. What is explicitly not being built

To keep the scope honest:

- **No multi-Principal.** Seats are defined; one Seat ships. 3.0.
- **No hosted kernel.** 3.0.
- **No public marketplace.** The mechanism ships; the catalogue is empty and local. 2.5 at the earliest.
- **No department authored by an agent.** A department is a Decision by the Principal (Principle 14). The
  Firm may *propose* one with evidence; it may not create one.
- **No cross-Firm federation.** 4.0 territory, and possibly never.
