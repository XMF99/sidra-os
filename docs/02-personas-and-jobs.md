# Personas and Jobs

## The Principal

There is exactly one persona in 1.0. Designing for an average of many users is how products become
featureless. This one is specific.

| Attribute | Value |
|---|---|
| Role | Independent operator: consulting, building a product, and running a small future business simultaneously |
| Technical level | High. Reads code, runs a terminal, has opinions about latency |
| Working context | Deep-work blocks broken by context switches. 3–8 live threads at any time |
| Tool taste | Linear, Figma, Cursor, Notion, Raycast. Rejects tools that feel slow or decorative |
| Primary constraint | Attention, not money or intelligence |
| Failure mode | Threads that go cold; decisions relitigated because the reasoning was never written down |
| Trust posture | Will delegate real work only if he can audit it. Will not tolerate confident fabrication twice |
| Emotional need | The relief of an organization behind him. Not novelty, not company |

**Design implications**

1. Keyboard-first, pointer-optional. A pointer-only path is a bug.
2. Density over whitespace. He would rather see nine things than three.
3. Honest machinery. Show the plan, the cost, the sources. Do not hide the seams; make them beautiful.
4. Zero onboarding tax. The Firm works on day one with defaults that are actually right.
5. No cheerfulness. The system reports; it does not congratulate.

## Anti-personas

Explicitly **not** designed for in 1.0, so we can say no cleanly:

- **The casual chat user.** Wants a friendly companion; will find the ceremony heavy. Not our user.
- **The framework builder.** Wants to compose their own agent graph. We ship a fixed org chart; they should
  use a framework instead.
- **The team lead.** Needs shared workspaces and permissions. That is the 3.0 enterprise product.
- **The compliance officer.** Needs retention policy, legal hold, and e-discovery. 3.0.

---

## Jobs to be done

Nine jobs, ordered by frequency. Each maps to a journey in
[03-user-journeys.md](03-user-journeys.md) and to requirements in the PRD.

| # | Job (in his words) | Current workaround | Sidra OS mechanism | Success signal |
|---|---|---|---|---|
| J1 | "Tell me what I should care about this morning." | Scanning inbox, Slack, notes | Standup Meeting → Morning Brief | Read before email |
| J2 | "Turn this half-formed idea into a real spec." | Long chat, manual restructuring | Directive → Mandate → Product + Engineering Work Orders → reviewed Artifact | Spec accepted with light edits |
| J3 | "Look into this properly and give me a recommendation, not a summary." | Ten tabs, no synthesis | Research Work Orders → Decision Forum → Brief with one recommendation | He acts on the recommendation |
| J4 | "Check my thinking. Find what's wrong with it." | Asking a model that agrees | Adversarial Review by QA + differently-motivated agents; Dissent preserved | Real objections he had not considered |
| J5 | "Remember this and use it later without me repeating it." | Notes he never reopens | Ingestion → Canon → automatic retrieval in every relevant Turn | Agents cite his own prior material unprompted |
| J6 | "Why did we decide this?" | Archaeology through chat logs | Decision record + supersession chain in Archive | Answer in under 60 s |
| J7 | "Do this every week without me asking." | Reminders he snoozes | Automation trigger → fenced Workflow → digest | Three standing automations trusted |
| J8 | "Produce the actual document, not advice about the document." | Copy-paste assembly | Artifact in the Vault, versioned, reviewed, exportable | Sends the artifact onward unchanged |
| J9 | "Tell me what this cost me." | No idea | Cost accounting per Turn/Engagement/month, live | Spends confidently within budget |

## Job-to-surface map

| Job | Entry surface | Primary room | Output surface |
|---|---|---|---|
| J1 | App launch | Lobby | Morning Brief card |
| J2 | ⌘Return Directive | Product Room | Vault artifact + Brief |
| J3 | ⌘Return Directive | Boardroom | Brief with Recommendation |
| J4 | ⌘K → "Review my…" | QA Room | Review with findings + Dissent |
| J5 | Drag to window / ⌘K → Ingest | Archive | Canon entries |
| J6 | ⌘⇧F search | Archive | Decision chain |
| J7 | ⌘K → "Automate…" | Console | Trigger + digest |
| J8 | Directive | Any room | Vault |
| J9 | ⌘I Inspector / Console | Console | Cost ledger |
