# Principles at Enterprise Scale

## 1. The original ten are unchanged

`/docs/00-vision/02-principles.md` is a KEEP. Not one of the ten principles needed amendment to carry
twenty-one departments, and the conflict rule — lower number wins — is unchanged.

Two of them get *harder*, which is worth stating:

**Principle 1 (the Principal's attention is the scarcest resource).** At eleven agents, a Firm that reported
too much was annoying. At two hundred, a Firm that reports proportionally to its size is unusable. The output
budget does not scale with the organisation: one Brief, one ask, under 600 words, regardless of whether three
agents or forty contributed. Everything in v2 that adds structure must justify itself against this, and the
notification budget of "five things may interrupt" does not move.

**Principle 5 (separation of powers).** At eleven agents the author/reviewer split was one rule. At twenty-one
departments it becomes a structural question: who reviews a department's work when the reviewer is inside the
department? v2's answer is Offices — cross-cutting authorities that sit outside the delivery line and hold
scoped vetoes. See ADR-0015.

## 2. Four additional principles

Numbered 11–14. They are *below* the original ten in every conflict, by construction: if a v2 principle
appears to justify overriding a v1 principle, the v2 principle is wrong.

### 11. A department is a boundary, not a label

Calling something a department must change what it can do, what it can see, what it can spend, and what it
can touch. If "Cybersecurity" and "Marketing" differ only in the prompt text, the organisation is theatre.

Concretely: separate memory namespace, separate capability grant, separate budget sub-ceiling, separate
standards, separate KPIs, separate dashboards, and no direct access to another department's internals. A
department talks to another department the same way the Principal talks to the Firm — through a typed,
budgeted, logged request.

### 12. Capability is composed, not concentrated

The instinct at scale is to build a bigger executive. The correct move is the opposite. Every capability
added to the Firm goes into a department that can be inspected, budgeted, disabled, replaced, or removed
without touching anything else. ADR-0004's five-tool executive is the strongest expression of this and
survives v2 unchanged.

A capability that cannot be isolated into a department does not belong in the Firm.

### 13. Structure must be earned by evidence

A department exists because there is recurring work whose quality measurably improves with a dedicated
charter, memory, and standards. Not because a real company would have one.

The test is empirical: if a department's Work Orders could be absorbed by a neighbouring department without
a measured drop in Deliverable quality, the department is overhead. This applies at instantiation and it
applies again at quarterly review — v1's KPI-based pruning, promoted from agents to departments.

The catalogue in `01-enterprise/04-department-catalog.md` specifies twenty-one departments. A given Firm may
run four of them. That is not a partial installation; it is the correct installation for that Firm.

### 14. The Firm's own structure is subject to the Firm's own rules

Adding, removing, or restructuring a department is a Decision (v1 decision engine): criteria first,
reversibility class stated, dissent recorded, review date set. Installing a Department Pack is an effectful
action with an effect class and an approval. Changing a Standard is a change that Guards enforce.

There is no meta-layer where organisational changes escape the audit chain. The org chart is data in the
event log like everything else, and "how did the Firm come to be shaped this way" is a question with a
traceable answer.

## 3. What these principles forbid

Stated as concretely as the v1 anti-patterns, because a principle that forbids nothing is decoration:

- **A shared mutable workspace between departments.** Two departments writing to the same artifact without a
  Work Order between them violates 11. Cross-department writes go through the Exchange.
- **An executive that grows tools as the Firm grows.** Violates 12 and ADR-0004.
- **Shipping all twenty-one departments enabled by default.** Violates 13 and Principle 1. First run
  installs Core plus whatever the Principal's stated work requires.
- **A "Firm Admin" mode that edits the org chart outside the event log.** Violates 14.
- **Per-department notification channels.** Violates Principle 1 outright. Twenty-one departments produce one
  notification ladder, not twenty-one.
- **A department-level "just do it" escape from Standards or review.** Violates Principle 5 and 14. Review
  Intensity (ADR-0018) adjusts *how much* review, never *whether* the author reviewed their own work.

## 4. New vocabulary

Additive to `/docs/00-vision/03-glossary.md`. No existing term changes meaning.

| Term | Definition |
|---|---|
| **Division** | A grouping of Departments under one executive. Eight exist. Divisions do not perform work; they route, arbitrate, and hold budget. |
| **Department** | An isolated, independently expandable unit of capability with its own agents, memory namespace, workflows, tools, standards, dashboards, and KPIs. |
| **Office** | A cross-cutting authority (Quality, Security, Cost, Architecture) that sits outside the delivery line and holds a scoped veto. An Office is not a Department. |
| **Department Pack** | The installable, signed, versioned artifact that *is* a Department: manifest, role archetypes, playbooks, standards, guards, registries, dashboards, evaluations. |
| **Role Archetype** | A charter template declaring a role's responsibilities, personality, memory scope, KPIs, capabilities, and decision boundaries. Data, not an agent. |
| **Agent Instance** | A live agent instantiated from a Role Archetype, with its own memory, KPI history, and ID. |
| **Standard** | A path-scoped or artifact-scoped rule that constrains how work is done, enforced automatically. Distinct from a Fence, which constrains *whether*. |
| **Guard** | A declarative validator that runs at a defined lifecycle point (pre-effect, pre-commit, post-turn, session start) and can warn or block. |
| **Registry** | A department-owned, append-only namespace of facts that cross document boundaries, with a named owner per fact. A structured projection of Canon. |
| **Exchange** | The kernel service that routes typed requests between departments and enforces isolation. |
| **Review Intensity** | A firm-wide or per-Engagement setting (`full` / `standard` / `lean`) controlling how many optional review gates run. Never disables ADR-0008. |
| **Seat** | A human identity with its own Fences, budget, and working memory. v2 defines Seats; v3 ships more than one. |
| **Stage Model** | A department's declared lifecycle phases and the gates between them. |
