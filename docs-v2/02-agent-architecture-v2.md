# Agent Architecture — Version 2.0

Extends `/docs/03-agents/01-agent-architecture.md`. The agent struct, the eight-phase Turn lifecycle, the
forbidden-actions list, and KPI-based pruning are all unchanged. This document adds the layer *above* the
agent: how two hundred agents are described without writing two hundred charters, and how they behave across
a department boundary.

## 1. Archetype and instance

v1 had eleven agents and eleven charters. That does not scale by multiplication — twenty-one departments
would need roughly two hundred hand-written, individually-maintained charters, and the maintenance cost of
keeping them consistent is what turns a Firm into a mess.

The split:

| | Role Archetype | Agent Instance |
|---|---|---|
| What it is | A charter template — data in a Department Pack | A live agent with an ID, memory, and history |
| Where it lives | `departments/<id>/roles/*.toml` | Created by the Registrar, recorded in the event log |
| How many | ~5 per department, ~100 across a full Firm | 0 to N per archetype, most often 0 or 1 |
| Cost when unused | One manifest entry | Nothing — it does not exist |
| Changes when | The role's definition changes (gated by evals) | Never — an instance's charter is frozen at instantiation |
| Reviewed by | Division approval + evaluation set | — |

**An instance's charter is frozen at instantiation.** This is not an optimisation, it is a correctness
property: an Engagement that ran last month must be reproducible, and if the archetype changed underneath it
the trace would describe an agent that never existed. When an archetype changes, existing instances continue
under their frozen charter and are retired-and-replaced on the next natural boundary. The event log records
both the archetype version and the instance ID on every Turn.

## 2. Instantiation policy

Declared per archetype:

| Policy | Behaviour | Typical use |
|---|---|---|
| `eager` | Instantiated when the department is installed | Department heads |
| `on_demand` | Instantiated on the first Work Order that requires it; retired after an idle period | Most specialists |
| `scheduled` | Instantiated for a recurring window | Roles tied to a standing meeting or a nightly job |

**Autoscale** is bounded in the manifest (`min`, `max`, `queue_target`). The Registrar adds an instance when
queue depth for an archetype sustains above target for a defined window, and retires one when it sustains
below. Two hard rules:

1. **Scaling never exceeds the department's budget sub-ceiling.** More agents does not mean more money; it
   means the same money spent with more parallelism. This is the rule that stops "add capacity" from being a
   way to route around the Cost Office.
2. **Scaling is logged as an event and appears in the department dashboard.** An organisation that grows
   without anyone noticing is exactly what Principle 4 exists to prevent.

**Retirement is not deletion.** A retired instance's memory moves to the department's episodic archive and
remains retrievable. Principle 3.

## 3. Identity

```
agent.exec                                   Kai — Executive
agent.cto | agent.ciso | agent.studio | …    Division executives (named, stable, v1 IDs preserved)
agent.office.quality | .cost | .architecture | .security
agent.office.<office>.reviewer.<nn>          Office reviewer instances
agent.<dept>.head                            Department head
agent.<dept>.<archetype>.<nn>                Specialist instance
```

Named agents — the thirteen in `01-org-chart-v2.md` — keep their v1 IDs forever. Instances get sequential
numbers within their archetype and never reuse a number, so `agent.backend.api-engineer.03` refers to exactly
one entity across the Firm's entire history even after it is retired.

**What the Principal sees.** Names for the thirteen. For instances, the role and the department:
"Backend — API Engineer", not `agent.backend.api-engineer.03`. Principle 10 says the building must feel
real; a building where every worker introduces themselves with a serial number does not. The ID is available
in the Inspector for anyone who wants it, which is the right place for machinery.

## 4. The Turn, unchanged

All eight phases from v1 run identically. Three additions to the context frame, all additive:

| Frame addition | Source | Effect |
|---|---|---|
| Applicable Standards | Standards Engine, resolved by artifact path and type | The agent knows the rules before it works, not after a Guard blocks it |
| Department registries | Registry namespace | The agent checks owned facts before inventing them |
| Department Canon slice | Memory service | Global Canon, filtered to what this department needs |

Retrieval is still capped at 40% of the frame (v1 routing strategy §5). Standards and registries count
against that cap and are ranked with everything else — a department with fifty Standards does not get a
larger frame, it gets the fifty ranked and the top few included, and a department whose Standards never make
the cut has too many Standards.

## 5. Cross-department behaviour

The rules an agent follows when work leaves its department. These are the rules that keep Principle 11
honest at the level where it is actually tested.

1. **Never reach across.** An agent may not read another department's working memory, call its tools, or
   address its agents. If it needs something from another department, it raises a `department.request` and
   waits, or escalates to its head if the request is out of its capability.
2. **Request contracts, not departments.** "I need `capability.security-review`", never "I need Cybersecurity".
   The Registrar resolves. This is what keeps departments replaceable.
3. **The requester's budget pays.** Stated in `03-department-architecture.md` §5, restated here because it is
   the rule agents are most tempted to route around by asking a Division executive to "just have someone
   look at it".
4. **Answer within your contract or refuse.** A department asked for something outside its declared
   `provides.contracts` refuses with `out_of_contract` rather than obliging. Being helpful across a boundary
   is how boundaries stop existing.
5. **Escalate rather than assume.** An ambiguous cross-department request goes back as a question, not
   forward as a guess. v1's escalation protocol, unchanged, applied at the new boundary.
6. **Depth 2 maximum.** A department answering a request may make one further request. Beyond that, escalate.

## 6. Standards and Guards from the agent's point of view

Two new things constrain an agent, and it matters that they constrain different axes:

- A **Fence** answers *may I?* — capability, budget, egress, filesystem, effect class. Enforced by the
  Permission Broker. Refusal is hard and immediate. (v1, unchanged.)
- A **Standard** answers *how well?* — the rules for doing this kind of work in this place. Supplied into the
  frame; violations are detected by Guards.
- A **Guard** answers *should this proceed?* at a lifecycle point — pre-effect, pre-deliverable, pre-commit,
  post-turn, session-start. It warns or blocks.

An agent that violates a Standard has not committed a security failure; it has produced substandard work. The
Guard blocks the Deliverable, the violation is recorded as `standard.violation` (ADR-0016), and the agent
gets one repair attempt with the specific rule quoted. Repeated violations of the same Standard by the same
archetype is a charter defect, surfaced in the department dashboard — not an agent to be scolded in a prompt.

This distinction is why Guards are not simply more Fences: conflating "you may not" with "you did it badly"
produces a system that either blocks too much or reviews too little.

## 7. KPIs, pruning, and department health

v1's KPI-based pruning is unchanged for agents and is promoted a level for departments (Principle 13).

| Level | Measured | Consequence of failure |
|---|---|---|
| Instance | Rework rate, escalation appropriateness, cost per Deliverable, review rejection rate | Retired by the Registrar; the archetype remains |
| Archetype | Aggregate instance performance, evaluation set results | Charter revision, gated by evals; repeated failure retires the archetype |
| Department | Deliverable quality, contract responsiveness, budget adherence, Guard violation rate, whether a neighbouring department could absorb it | Quarterly review Decision; possible merge or retirement |
| Office | Veto rate — **too low is the failure mode** | An Office approving above 95% is a defect, exactly as v1's ADR-0008 specifies for reviewers |

That last row is the one most likely to be quietly dropped during implementation, and it is the one that
determines whether the entire review structure is real or ceremonial.

## 8. What an agent still may never do

v1's forbidden-actions list, unchanged, plus four:

- Write outside its department's filesystem scope.
- Read another department's memory namespace without a granted, request-scoped, expiring read.
- Instantiate or retire another agent — only the Registrar does that.
- Modify a Standard, a Guard, a registry schema, or a manifest. Those are Pack changes, and Pack changes are
  Decisions under Principle 14.
