# Architecture Issue Register

Known defects and open questions in the Sidra OS design corpus. An issue lives here from the moment it is
identified until it is resolved, so that a known problem is never rediscovered as a surprise.

**This register is not a backlog of improvements.** Every entry is something currently documented that is
wrong, contradictory, or undecided. Feature ideas belong in the roadmap.

| Field | Meaning |
|---|---|
| **Severity** | *Blocking* — must be resolved before the named milestone · *Correctness* — the documentation states something false · *Consistency* — two documents disagree · *Open question* — a decision not yet made |
| **Resolve before** | The milestone that would inherit the defect if it shipped |

---

## Open

### AI-001 — Division executives are named as department heads, contradicting the layer model

| | |
|---|---|
| **Severity** | Consistency |
| **Resolve before** | M16 |
| **Found** | Strict audit of the frozen v2 corpus |
| **Status** | Open — approved for deferral past T1.3 |

**What is wrong.** `/docs-v2/01-enterprise/04-department-catalog.md:285` and
`/docs-v2/03-game-studio/02-game-studio-department.md:3` both name **Lyra** as head of the Game Development
department. `/docs-v2/01-enterprise/04-department-catalog.md:209` reads as giving **Corvus** a Division seat,
an Office, and a department head role simultaneously.

**Why it matters.** ADR-0015 established that Offices hold vetoes and departments hold delivery, and used
exactly this argument to remove Cass from Finance: an agent cannot both produce work and hold the veto over
it, because that is Principle 5 collapsing. Lyra and Corvus are now in the position ADR-0015 declared
untenable.

The contradiction is self-evident within one file: the diagram at
`/docs-v2/01-enterprise/04-department-catalog.md:36` places Lyra **above** the department, while line 285
places her **inside** it as its head.

**Why M16.** The Connector Framework grants connectors to *departments*, and its authorisation model reads the
department head as the accountable party. Inheriting an ambiguous head assignment into a permission model is
how a grant ends up with no owner.

**Options.**

1. Remove the head assignments; the departments' Role Archetypes supply a head on instantiation, as every
   other department does. Consistent with ADR-0014 and ADR-0015. Cheapest.
2. Keep the assignments and amend ADR-0015 to permit dual-hatting for Divisions with a single department.
   Requires arguing why Cass was removed from Finance but Lyra may stay in Game Development.
3. Split the roles: a new agent heads the department; Lyra and Corvus keep their Division and Office seats.
   Adds two agents to a roster the design has kept deliberately small.

**Recommendation.** Option 1, with a one-line ADR recording that department heads are always instantiated from
Role Archetypes and never named in a catalogue.

---

### AI-002 — `docs-v2/03-Intelligence/` collides with `docs-v2/03-game-studio/`

| | |
|---|---|
| **Severity** | Consistency |
| **Resolve before** | M16 |
| **Status** | Open |

Two directories share the `03-` ordinal, and `03-Intelligence` is TitleCase where every other `docs-v2`
directory is lowercase-kebab. The path was created as specified; flagged rather than silently corrected.

**Options.** Renumber to `06-intelligence`; or rename to `03a-intelligence`; or accept the collision and
document that ordinals in `docs-v2` are not unique. The third makes the ordinal meaningless, which is most of
its value.

---

### AI-003 — Three E1 value objects are named by no task

| | |
|---|---|
| **Severity** | Open question |
| **Resolve before** | T1.5 |
| **Status** | **Resolved** — see below |

Epic E1's component list named twelve value objects; the task breakdown covered nine. `ContractRef`,
`ArtifactRef` and `PlanVersion` belonged to no task.

**Resolution (approved 2026-07-21):** `ContractRef` and `ArtifactRef` fold into **T1.5** (`Task`);
`PlanVersion` folds into **T1.7** (`PlanVersion`). No new task is created.

**Documentation action outstanding:** `/docs-v2/03-Intelligence/MISSION_ENGINE_IMPLEMENTATION_PLAN.md`
needs three edits to record this — the T1.5 and T1.7 rows, and the E1 component table. Not yet applied.

---

## Resolved

### AI-004 — Milestone numbering meant three different things

| | |
|---|---|
| **Severity** | Blocking |
| **Resolved by** | ADR-0032, `/MILESTONE_REGISTRY.md` |

Three documents assigned conflicting meanings to the same milestone numbers. The Mission Engine plan flagged
it as risk IR-10 and required resolution before T1.1; **T1.1 proceeded without it**, and the ambiguity
surfaced at the next instruction.

Resolved by a single global sequence: M1–M14 unchanged, Mission Engine is M15, no track-local numbering, and
no renumbering once a milestone is Documented.

**Lesson recorded.** A risk that a plan itself marks as blocking should block. The cost of resolving AI-004
after T1.1 was a stale label in shipped source and a wasted planning turn; before T1.1 it would have been one
paragraph.

---

## Reported but not yet triaged

Findings from the strict audit of the frozen v1/v2 corpus. Each is a factual error in a document rather than a
design contradiction, and none blocks current work.

| Ref | Location | Problem |
|---|---|---|
| AI-005 | `/docs-v2/00-overview/01-v1-review.md:10` | States "38 KEEP, 17 EXTEND"; the table below it tallies 8 KEEP, 29 EXTEND, 3 SUPERSEDE — the ratio is inverted |
| AI-006 | ~5 locations | "55 documents" claim; the actual v1 count is 52 |
| AI-007 | `/docs-v2/00-overview/01-v1-review.md` §4 | Classification inconsistent with the same document's §2 table |
| AI-008 | `/docs-v2/01-enterprise/04-department-catalog.md` | Five department entries have a malformed `head:` field (`"Atlas's department"` and similar) |

**Common cause.** AI-005 and AI-006 are both asserted statistics that were never counted — the same defect
class that produced a wrong task total in the Mission Engine implementation plan, caught only by a
verification script. Any derived figure in a document needs a counting step, not a recollection.
