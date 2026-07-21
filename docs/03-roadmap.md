# Roadmap

Four releases. Each one is defined by a change in *what the Principal can stop doing themselves*, not by a
list of features. A version that adds capability without removing work from the Principal has failed its own
brief.

## 1.0 — "Atrium" · the Firm exists

**The promise:** you delegate an intent and receive one accountable Brief, produced by a real organisation
whose work you can audit.

Everything described in this documentation set: eleven agents, five memory layers, the six engines, the Night
Atrium shell, the plugin host, the encrypted local Vault, hard Fences, and an event log that makes every claim
checkable. Single Principal, single machine, single Firm.

**Explicitly not in 1.0:** multi-user anything, mobile, cloud sync, agent-authored code execution, direct
integration with third-party SaaS beyond what a plugin provides, and voice.

**Success looks like:** the Principal stops opening a chat window for work-shaped tasks; more than half of
Directives complete without an Approval Request; and the Vault after ninety days is more valuable than the
application.

---

## 2.0 — "Field" · the Firm reaches outside the building

**The promise:** the Firm can act in your other tools, and can be reached when you are not at your desk.

- **Connectors** as first-class plugins with OAuth handled by the kernel: calendar, mail, issue trackers,
  code hosts, document stores. Read first, write behind class-2 approval, egress inspected as always.
- **Companion (mobile, read + approve).** Not a second client — a remote control. Read Briefs, answer
  Approval Requests, dictate a Directive. The desktop remains the only place work happens; the phone is a
  window and a signature pad. Pairing is direct and end-to-end encrypted, with no server holding data.
- **Scheduled and event-driven engagement at scale**: automations triggered by connector events, not just
  time and file changes.
- **Agent-authored artifacts that execute**: sandboxed scripts and notebooks produced by Vega, run in a
  Wasm-isolated environment inside the Vault, with output as a Deliverable.
- **Voice Directive**, local speech-to-text, because dictating an intent is faster than typing one and
  Directives are short.

The architectural bet 1.0 makes that pays off here: the Rust kernel is already a service with a typed command
surface, so the Companion is a transport change rather than a rewrite.

---

## 3.0 — "Chambers" · the Firm serves a team

**The promise:** more than one Principal, without becoming a chat app with an org chart.

- **Multi-Principal Firms.** Shared Canon, per-Principal working memory, per-Principal Fences and budgets.
  Delegation across people: a Directive from one Principal can produce an Approval Request for another.
- **Kernel as a server.** The same crates, hosted, with the desktop app as a client. Local-first remains
  available and remains the default posture; hosted is an explicit, reversible choice with a documented
  threat model of its own.
- **Roles and separation of duties** at the human layer, mirroring what Principle 5 already does at the agent
  layer: the person who requests is not the person who approves, above a threshold.
- **Firm templates**: an org chart, charter set, and Canon exportable and installable — a consultancy's Firm,
  a research group's Firm.
- **Audit for organisations**: retention policy, exportable compliance evidence, and the hash chain doing
  work it was designed for from day one.

This release is the reason the event log, the capability model, and the ID scheme were built the way they were
in 1.0. None of it needs to be redesigned; it needs to be scaled.

---

## 4.0 — "Continuum" · the Firm improves itself

**The promise:** the organisation gets measurably better at your work over time, and can show you how.

- **Charter evolution.** Agents propose amendments to their own charters based on measured KPI outcomes, with
  the evaluation set attached as evidence. The Principal approves; nothing self-modifies unattended.
- **Learned routing.** The routing table becomes a learned policy over observed cost/quality outcomes, still
  deterministic at inference time and still fully explainable — the Console shows why a Turn went where it
  went, with the evidence.
- **Procedural memory that compiles.** Repeated Engagement shapes are promoted automatically into Workflows,
  proposed to the Principal, and thereafter run as deterministic DAGs at a fraction of the cost. Principle 8
  reaching its natural conclusion.
- **Local model fluency.** As open models mature, the `worker` and `fast` classes move on-device by default,
  reducing cost toward zero and making Principle 7 total rather than partial.
- **Firm review.** A quarterly Engagement in which the Firm audits itself: what it got wrong, what it
  over-escalated, where the Principal edited most, what it should stop doing. Output is a Brief with one ask,
  like everything else.

---

## What we will not build, at any version

- **A chatbot mode.** The fast lane covers the case; a mode toggle would let the product's centre of gravity
  drift back to the thing everyone else already makes.
- **Telemetry.** Not anonymous, not aggregate, not opt-in. Product decisions come from the people using it,
  who can be asked.
- **An agent marketplace with unvetted autonomy.** Plugins extend capability under explicit grants; they never
  arrive with autonomy the Principal did not deliberately confer.
- **Autonomous financial transactions.** Class-3 effects that move money stay behind a human signature
  permanently, regardless of how good the models become.
- **Engagement mechanics.** No streaks, no gamification, no notifications designed to pull the Principal back.
  Principle 1 says their attention is the scarcest resource, and a product that spends it to increase its own
  usage numbers is lying about what it is for.

## How this roadmap changes

Version boundaries move; the ordering does not. The dependency is real: connectors before multi-user (shared
context is worthless without external data), multi-user before self-improvement (learning needs a corpus
larger than one person's work). Anything proposed out of order needs an ADR arguing why the dependency is not
real.
