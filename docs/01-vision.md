# Vision

## 1. The one-sentence claim

Sidra OS gives one person the operating leverage of a fifty-person company, by making delegation — not
prompting — the primary interaction with artificial intelligence.

## 2. The problem, stated precisely

A capable individual working alone does not fail for lack of intelligence. He fails for lack of
*organizational capacity*: the ability to hold twelve threads, remember what was decided in March, chase
his own follow-ups, review his own work adversarially, and produce finished artifacts on a schedule.

Current AI tools do not solve this. They solve *fragments* of it, and they solve them statelessly:

| Failure of current tools | Consequence for a solo operator |
|---|---|
| The conversation is the unit of work | Nothing accumulates. Every session restarts the company. |
| The human is the router | You must know which prompt, which tool, which context. That is a full-time job. |
| No adversarial review | The model that wrote the plan grades the plan. Errors compound silently. |
| Memory is a feature, not a substrate | Recall is lossy, unauditable, and cannot be corrected. |
| Output is chat text | Work products are not artifacts. Nothing is versioned, filed, or signed. |
| No standing intent | The system never acts unless poked. There is no organization, only a tool. |

The gap is not model capability. It is **institutional structure**.

## 3. The thesis

An organization is a technology for turning intent into outcome under conditions of limited attention.
Its mechanisms — roles, delegation, escalation, meetings, review, memoranda, records — are not bureaucracy.
They are error-correction machinery, refined over centuries.

Sidra OS implements those mechanisms literally. Not as metaphor or theming, but as the actual runtime:

- A **role** is a persistent agent with a bounded charter, tools, and decision authority.
- **Delegation** is a durable, typed Work Order with acceptance criteria and a deadline.
- **Escalation** is a defined boundary crossing that produces an interrupt, not a silent guess.
- A **meeting** is a bounded, minuted deliberation protocol with a required output.
- **Review** is a different agent, with a different objective function, and the power to reject.
- A **record** is an immutable, hash-chained entry that outlives the conversation.

The organizational chart is the prompt architecture. The reporting line is the control flow. The minutes
are the memory.

## 4. What Sidra OS is

**A digital headquarters.** You open it the way you would walk into a building. There is a lobby with
today's briefing, rooms where departments work, a boardroom where decisions are made, an archive that
remembers everything, and a console where you can watch the machinery run.

**An executive relationship, not a chat.** You speak to one entity — the Executive AI. It never does the
work itself. It analyzes, forms a strategy, assigns, supervises, collects, and returns a single brief with
one recommendation and a clear ask. The staff exist and you can watch them, address them, and overrule
them — but you are not required to manage them.

**Local-first and yours.** The entire company lives in one encrypted directory on your machine. It runs
without a network for everything except model inference. There is no server, no tenant, no telemetry. If
Anthropic, OpenAI, and this project all vanish tomorrow, the archive is still readable SQLite and Markdown
on your disk.

**Legible.** Every output can be traced to the agent that produced it, the model that ran, the sources it
read, the cost it incurred, and the decision that authorized it. Nothing is a black box you must trust.

## 5. What Sidra OS is not

- **Not a chatbot with personas.** The staff are not costumes on one model call. They have separate memory
  scopes, separate tool grants, separate authority, and the ability to refuse and escalate.
- **Not an agent framework.** It is a finished product with an opinionated organization. Frameworks make you
  assemble the company. Sidra OS ships the company.
- **Not autonomous.** It has standing initiative inside a fence you define, and it stops at the fence. It
  never spends money, sends a message to a human, or deletes your data without an explicit approval.
- **Not a team collaboration tool.** Version 1.0 has exactly one human seat, by design. Multi-human is a
  1.0-compatible extension, not a 1.0 feature.
- **Not a general OS.** "OS" is used in the sense of *operating system for your work*: a kernel, a scheduler,
  a filesystem, a permission model, and applications. It runs as a desktop application on macOS, Windows,
  and Linux.

## 6. The experience we are aiming at

The feeling on opening the application should be *arrival at a serious institution that has been working
while you were away*. Concretely:

- The lobby shows what happened overnight, what needs you, and one recommended focus. Not an empty prompt box.
- Latency is honest: work that takes four minutes shows a plan, a progress spine, and a live cost meter —
  never a spinner.
- The interface is dark, quiet, and dense, in the register of a trading desk or a control room. Brass on
  ink, not neon on black. It does not celebrate. It reports.
- Every surface is reachable from the keyboard within two keystrokes. The pointer is optional.
- When the system does not know, it says so and asks a specific question. It never fills a gap with fluent
  invention.

## 7. Principal, not user

The single human is referred to throughout this documentation as the **Principal**. This is deliberate. A
user operates a tool. A principal directs an organization, delegates authority, and bears accountability
for outcomes. Every design decision in Sidra OS answers to the second relationship.

## 8. Success criteria for 1.0

Sidra OS 1.0 has succeeded if, after ninety days of daily use by the Principal:

1. He initiates work by **stating an outcome**, not by choosing a tool, in >80% of sessions.
2. The morning brief is read before email on >70% of working days.
3. At least 60% of delivered artifacts are accepted or accepted-with-edits, not rejected.
4. He can answer "why did we decide X?" from the Archive, unaided, in under sixty seconds.
5. He trusts the system enough to grant standing automation on at least three recurring processes.
6. He would be materially annoyed to lose it. This is the only criterion that actually matters.

## 9. Long horizon

The single-principal product is not a stepping stone that gets thrown away. It is the kernel. An enterprise
tenant is the same kernel with the Principal replaced by a *seat*, the local vault replaced by a *workspace*,
and the org chart made editable rather than fixed. That path is specified in
[../02-architecture/09-scalability.md](../02-architecture/09-scalability.md) and every schema, API, and
capability decision in this document set was made with it in view — without paying its cost in 1.0.
