# Glossary

Canonical vocabulary. These terms are used verbatim in code identifiers, database tables, API surfaces, and
user-facing copy. Where a term appears in the UI, the UI string is given. Synonyms listed as *banned* must
not appear anywhere in the product.

---

## Core entities

**Principal** — the single human user. Code: `principal`. UI: "you". *Banned: user, owner, admin.*

**Firm** — the whole simulated organization inside one vault. Code: `firm`. Future multi-tenant unit.

**Staff** — the set of agents. An individual is an **Agent**, never a "bot", "assistant", or "persona".

**Agent** — a persistent role with a charter, memory scope, tool grants, decision authority, and identity.
Code: `agent`. UI: the agent's name (e.g. "Rune").

**Executive** — the Executive AI, named **Kai**. Sole default interlocutor of the Principal. Code:
`agent.exec`. UI: "Kai" or "the Executive". *Banned: CEO-bot, orchestrator, supervisor.*

**Department** — a grouping of agents with a shared domain and a department head. Code: `department`.
UI: "Engineering", "Product", etc.

**Room** — the UI surface for a department or function. UI: "Engineering Room". Rooms are *places*, not tabs.

---

## Work

**Directive** — a statement of intent from the Principal. The atomic input of the system. Code: `directive`.
UI: "Directive". *Banned: prompt, query, request, message.*

**Mandate** — the Executive's interpretation of a Directive: objective, constraints, success criteria,
budget, deadline. One Directive produces exactly one Mandate. Code: `mandate`.

**Work Order** — a typed, durable assignment from one agent to another, carrying inputs, acceptance
criteria, capability grant, budget, and deadline. Code: `work_order`. UI: "Work Order". *Banned: task,
ticket, job, subtask.*

**Deliverable** — the output an agent returns against a Work Order: an artifact reference plus a
self-assessment against acceptance criteria. Code: `deliverable`.

**Artifact** — a versioned file in the Vault produced by the Firm: document, spec, dataset, image, code
bundle. Code: `artifact`. UI: "Artifact".

**Brief** — the Executive's single-page synthesis returned to the Principal: situation, what was done,
findings, recommendation, one ask, cost. Code: `brief`. UI: "Brief". *Banned: summary, report, output.*

**Engagement** — the full tree rooted at one Directive: Mandate, Work Orders, Meetings, Decisions,
Artifacts, Brief. The unit of history, cost accounting, and archival. Code: `engagement`.

---

## Governance

**Decision** — a recorded choice with options considered, rationale, decider, reversibility class, and
review date. Code: `decision`. UI: "Decision".

**Approval Request** — an interrupt raised when an agent hits a fence and needs the Principal's
authorization. Code: `approval_request`. UI: "Needs your approval".

**Fence** — the boundary of an agent's autonomy: spend ceiling, egress allowlist, filesystem scope,
irreversibility class. Code: `fence`. UI: "Limits".

**Capability** — a single named permission grant, e.g. `net.fetch:docs.stripe.com`, `fs.write:vault/drafts`.
Code: `capability`.

**Charter** — the immutable core definition of an agent: purpose, responsibilities, authority, refusals.
Code: `charter`.

**Escalation** — passing a blocked Work Order up the reporting line. Terminates at the Principal.

---

## Deliberation

**Meeting** — a bounded, protocol-driven, multi-agent deliberation producing Minutes and at least one
Decision or Work Order. Code: `meeting`. UI: "Meeting".

**Minutes** — the durable record of a Meeting: attendees, positions, dissent, outcome. Code: `minutes`.

**Standup** — the scheduled 06:45 Meeting that produces the Morning Brief.

**Review** — an adversarial evaluation of a Deliverable by an agent other than its author, producing
`pass`, `pass_with_notes`, or `block` with specific findings. Code: `review`.

**Dissent** — a recorded disagreement by an agent with an outcome. Preserved in Minutes verbatim. Dissent is
never averaged away.

---

## Memory

**Working Memory** — the assembled context for a single model call. Ephemeral. Code: `context_frame`.

**Episodic Memory** — the append-only event log of everything that happened. Code: `events`.

**Semantic Memory** — embedded, retrievable knowledge chunks. Code: `chunks`.

**Procedural Memory** — learned repeatable procedures. Code: `playbook`. UI: "Playbook".

**Canon** — organizational facts held as true firm-wide, with provenance and confidence. Code: `canon`.
UI: "Canon". Contradiction of Canon triggers a Reconciliation.

**Consolidation** — the nightly process that promotes episodes into semantic, procedural, and Canon memory.
UI: "Night Shift".

---

## Runtime

**Kernel** — the Rust orchestration core. Owns state, scheduling, permissions, and the event bus.

**Turn** — one agent execution: context assembly, model call(s), tool calls, output validation. The unit of
cost and tracing. Code: `turn`.

**Workflow** — a durable, resumable execution graph of steps. Code: `workflow`.

**Trigger** — the cause of an automated run: schedule, event, file watch, or threshold. Code: `trigger`.

**Vault** — the encrypted local directory holding all Firm data. Code: `vault`.

**Model Class** — routing tier (`reasoner`, `worker`, `fast`, `embed`, `vision`) decoupled from vendor model
names. Code: `model_class`.

---

## Interface

**Shell** — the persistent application frame: Rail, Sidebar, Stage, Inspector, Dock.

**Stage** — the main content region.

**Inspector** — the right panel showing provenance, cost, and trace for whatever is selected.

**Dock** — the bottom presence strip showing live agent activity.

**Command Palette** — ⌘K. Verb-first command surface.

**Search Everywhere** — ⌘⇧F. Federated retrieval across all record types.

**Ledger Line** — the signature hairline at the top of the Shell that carries live Firm activity.
