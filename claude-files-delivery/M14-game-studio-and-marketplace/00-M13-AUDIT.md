# M13 Architecture Audit — gate before M14

**Purpose.** STEP 1 of the workflow: before architecting the next milestone, verify the previous one is
architecturally complete and report any gap. This audit gates M14 (Game Studio and Marketplace).

| | |
|---|---|
| Milestone audited | M13 — Departments |
| Registry status | Documented (`/MILESTONE_REGISTRY.md` §2, 2.0 table) |
| Audit verdict | **Architecturally complete. No gap blocks M14.** |
| Authoritative sources | `/MILESTONE_REGISTRY.md`, `/docs-v2/03-department-architecture.md`, `/docs-v2/04-department-catalog.md`, `/docs-v2/adr/0013-department-pack-as-unit-of-modularity.md`, `/docs-v2/adr/0014-role-archetypes-and-lazy-instantiation.md`, `/docs-v2/adr/0017-registries-as-canon-projections.md` |

M14 is a **Department Pack installed through M13's machinery and distributed through the Marketplace**
(`/MILESTONE_REGISTRY.md` M14 row: *"a Department Pack installed through the M13 machinery"*). The single most
important thing this audit must confirm is therefore that **the Pack install machinery and the Registrar
exist** in the M13 architecture, because M14 builds the Game Studio *on top of* them and adds no new install
mechanism (ADR-0045, this package).

---

## 1. Checklist result

Every artifact the workflow requires for a Documented milestone is present in the M13 architecture:

| Required artifact | Present | Location |
|---|---|---|
| Architecture document | ✅ | `/docs-v2/03-department-architecture.md` (§1–§8) |
| The Department Pack contract | ✅ | §1 (twelve-directory layout); §2 (`department.toml` manifest) |
| ADRs | ✅ | ADR-0013 (Pack as unit of modularity), 0014 (archetypes & lazy instantiation), 0017 (registries) |
| Domain model | ✅ | §2 manifest, §3 Role Archetypes (ten sections + four v2 fields) |
| Isolation model | ✅ | §4 — the seven enforced isolation properties (memory, capability, budget, fs, no-direct-invocation, standards precedence, quarantine) |
| The Exchange (cross-department requests) | ✅ | §5 — typed, budgeted, logged; contracts-not-departments; depth limit 2 |
| Install validation | ✅ | §8 — **the twelve mechanical install checks**, hard refusal, no override |
| Department lifecycle | ✅ | §7 — Proposed → Installed → Granted → Staffed → Operating → Reviewed → Quarantined → Retired |
| The Registrar | ✅ | §3 (creates Agent Instances), §5 (resolves `requires.contracts`), §7 (staffs/operates) |
| Dashboards | ✅ | §6 — fixed panel set, token-contract only |
| Security | ✅ | §4 (capability ceiling checked by the Permission Broker at issue time), §8 check 2 (signature) |
| Acceptance criteria | ✅ | Exit criterion: three departments installed from Packs, one Exchange request end to end (`/MILESTONE_REGISTRY.md` M13 row) |

## 2. The two dependencies M14 leans on hardest — confirmed present

Both are load-bearing for M14 and both are fully specified in M13:

1. **The Pack install machinery (the twelve checks).** `/docs-v2/03-department-architecture.md` §8 defines
   twelve mechanical, kernel-run install checks with named hard refusals and no "install anyway". M14's
   acceptance item 1 ("the Pack installs and passes all twelve validation checks",
   `/docs-v2/03-integration-plan.md` §9.1) is *exactly* this machinery exercised by a real Pack. **M14 adds no
   thirteenth check to the department contract** — the CCGS attribution/provenance requirement is enforced as
   a Pack-content check the compiler and P0 gate own (architecture §7), and the Marketplace validates the same
   twelve checks locally before publishing (`/docs-v2/05-marketplace-and-packs.md` §6.1).
2. **The Registrar and the department lifecycle.** §7 defines the eight lifecycle phases including
   **Retired** ("Instances retired, Pack disabled, memory namespace preserved read-only, history intact"),
   which is the mechanism M14's headline acceptance item (uninstall-leaves-Firm-working,
   `/docs-v2/03-integration-plan.md` §9.6) depends on. The Registrar resolves `requires.contracts` (§5), which
   M14's Exchange acceptance item (§9.5: `capability.security-review` to Cybersecurity) exercises.

## 3. Discrepancies noted (non-blocking)

Per the standing rule "if registry metadata appears stale compared to the sources, note it and continue":

1. **Migration-band convention across 2.0 is stated per-milestone, not in one table.** The M16 package records
   "mission migrations end at `0024`", implying M11–M15 collectively consume `0001`–`0024`. This M14 package is
   assigned band **`0016`–`0018`** (per the mission scope handed to this delivery), which sits inside that
   range and does not collide with M11–M13 (below `0016`) or M15 (above `0018`). This is a sequencing
   convention, not an architectural gap. Recorded so AntiGravity confirms the band is free before writing
   `0016_*`. **Not a blocker for M14.**
2. **Primary-document path drift.** `/MILESTONE_REGISTRY.md` lists M14's primary documents as
   `/docs-v2/03-game-studio/*`; the actual sources are `/docs-v2/01-repository-analysis.md`,
   `/docs-v2/02-game-studio-department.md`, `/docs-v2/03-integration-plan.md`, and
   `/docs-v2/05-marketplace-and-packs.md`. A path label lag, not a missing document. Recommended: correct the
   registry pointer during the next integration pass. **Not a blocker for M14.**

## 4. Gate decision

M13 is architecturally complete. **Proceed to M14 (Game Studio and Marketplace).** No M13 architecture is
modified by the M14 package; M14 *installs a Pack into* the substrate M13 already specifies (the twelve
install checks, the Registrar, the eight-phase lifecycle including Retired) and *distributes* it through the
Marketplace layer already specified in `/docs-v2/05-marketplace-and-packs.md`. That is the correct dependency
direction: M14 consumes M13, and the kernel gains no department-specific logic (ADR-0019; invariant
`/MASTER_IMPLEMENTATION_GUIDE.md` §3.12).
