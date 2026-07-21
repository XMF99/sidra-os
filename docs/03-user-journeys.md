# User Journeys

Nine journeys, frame by frame. Each specifies what the Principal does, what the system does, what is
persisted, and what the interface shows — including the unhappy paths. These are the specification for the
screens described in [../05-experience/](../05-experience/).

Notation: **P** = Principal action, **S** = system behaviour, **UI** = what is on screen, **DB** = what is
written.

---

## J1 — The Morning Brief

**Trigger:** 06:45 scheduled Standup, or app launch if the Standup has not yet run today.

1. **S** — At 06:45 the Automation Engine fires `standup.daily`. The Kernel wakes, checks budget, and starts
   a Meeting of type `standup` with Kai chairing and all department heads attending.
2. **S** — Each head reports from its own scope: open Work Orders, blocked items, overnight Consolidation
   findings, KPI drift, calendar-adjacent commitments recorded in Canon.
3. **S** — Kai synthesizes: at most 5 items, each with a stated *why it matters* and a *suggested action*.
   Exactly one item is marked "Focus".
4. **DB** — `meetings` row, `minutes` row, `briefs` row (kind=`morning`), events for each Turn.
5. **P** — Opens the app.
6. **UI** — Lobby. The Brief occupies the Stage as a single card in Newsreader serif: date, one-line
   situation, Focus item, then up to four secondary items, then "Overnight" (what the Night Shift learned),
   then cost. Each item has inline actions: `Take it` (creates a Directive pre-filled), `Delegate`, `Defer`,
   `Dismiss`.
7. **P** — Presses `1` to accept the Focus item.
8. **S** — Creates a Directive from that item; Kai returns a Mandate preview.
9. **Unhappy path — nothing happened overnight:** the Brief says so in one line and shows the three oldest
   open threads instead. It never manufactures activity to look busy.
10. **Unhappy path — budget exhausted:** Standup runs in `fast` model class only, is marked "reduced", and
    the first item is the budget itself.

---

## J2 — Idea to specification

**Directive:** "Turn my notes on the invoicing feature into a real spec I could hand to a contractor."

1. **P** — ⌘Return anywhere, types the Directive, ⏎.
2. **S** — Kai classifies: complexity `Standard`, domain `product`, artifact expected `document`. Retrieval
   pass over Canon and Vault finds three related notes and a prior Decision on billing scope.
3. **UI** — Mandate preview slides up over the Stage within 3 s:
   - Objective, Success criteria (4 bullets), Constraints (from Canon: "contractor has no access to prod"),
     Staffing (Iris lead, Vega technical, Argus review), Budget estimate $0.40, Deadline "today 14:00",
     Sources found (3, expandable).
4. **P** — Edits one success criterion, presses ⌘⏎ to Authorize.
5. **S** — Workflow starts. Work Order 1 → Iris (structure and requirements). WO 2 → Vega (technical
   feasibility and interfaces), depends on WO 1 §3 only, so it starts as soon as that section commits.
   WO 3 → Argus (review) after both.
6. **UI** — Stage becomes the Engagement view: a vertical progress spine, one node per step, each showing
   agent avatar, state (`queued/running/blocked/done`), elapsed, and cost. The Dock shows two agents
   active. The Ledger Line pulses. Partial artifact content streams into a preview pane as it commits.
7. **S** — Argus returns `pass_with_notes`: two findings (missing non-functional requirements, ambiguous
   acceptance for partial refunds). Kernel routes findings back to Iris for a single rework cycle.
8. **S** — Kai composes the Brief.
9. **UI** — Brief replaces the spine: Situation, Actions (3 lines), Findings, Recommendation, One Ask
   ("Confirm partial-refund behaviour: pro-rata or none — I assumed pro-rata"), Cost $0.37, Confidence
   High-on-structure / Medium-on-refund-policy.
10. **DB** — `engagements`, `mandates`, 3 × `work_orders`, `deliverables`, `reviews`, `artifacts` v1 and v2,
    `briefs`, ~40 `events`.
11. **P** — ⌘I opens the Inspector on the artifact: sources, models used, per-step cost, the Decision that
    constrained scope.
12. **Unhappy path — sources are thin:** Kai's Mandate says so explicitly and proposes either ingesting more
    material or proceeding with assumptions listed. It does not silently invent domain facts.

---

## J3 — Research to recommendation

**Directive:** "Should I use Stripe Billing or build metering myself?"

1. **S** — Kai classifies complexity `Deep`, and because the outcome is a choice, it schedules a **Decision
   Forum** rather than a plain workflow.
2. **S** — Parallel research Work Orders: Vega (implementation cost, 2 weeks estimate), Cass (fee modelling
   at three revenue scenarios), Rune (architectural lock-in and exit cost), Orin (whether usage data would
   be needed for future model features).
3. **S** — Egress: each fetch host is checked against the allowlist. `docs.stripe.com` is not yet allowed →
   one Approval Request, batched with any others, presented once.
4. **UI** — Approval sheet: "Rune wants to read docs.stripe.com. Allow: once / this session / always."
5. **S** — Decision Forum convenes: each agent states a position with evidence; Kai names the criteria and
   weights *before* seeing conclusions; Argus argues the strongest case against the leading option;
   dissent is recorded verbatim.
6. **DB** — `meetings`, `minutes` (with positions and dissent), `decisions` with options, criteria, weights,
   reversibility `class-2 (reversible in ~3 weeks)`, review date +6 months.
7. **UI** — Boardroom shows the table view during deliberation: attendee cards, live position chips
   (`for/against/abstain`), the criteria matrix filling in. It is watchable but does not require watching.
8. **UI** — Brief: Recommendation "Stripe Billing until $40 k MRR, then re-evaluate — trigger recorded."
   One Ask: "Confirm the $40 k trigger; I have set a review Decision for it."
9. **S** — Because the Decision carries a threshold, the Automation Engine registers a `threshold` trigger
   so the review actually happens.
10. **Unhappy path — agents disagree irreconcilably:** Kai does not average. The Brief presents both
    positions, the crux disagreement in one sentence, and asks the Principal to break the tie.

---

## J4 — Adversarial review of the Principal's own work

**Directive:** "@argus tear apart my pricing page copy" with a file dragged in.

1. **P** — Drags `pricing-v3.md` onto the window; drop zone highlights; ⌘Return, direct-address to Argus.
2. **S** — Direct address bypasses Mandate formation but still creates an Engagement. Kai is informed and
   may add context, not gate.
3. **S** — Argus runs with an explicitly adversarial objective and no incentive to please. Retrieval brings
   in Canon (ICP definition, prior positioning Decision) so criticism is grounded, not generic.
4. **UI** — Findings list: each with severity, location, the reasoning, and a proposed fix. Sortable.
   Nothing is softened.
5. **P** — Accepts four findings, rejects one with a reason.
6. **S** — Rejection with reason is written to Canon as a positioning preference so future critiques respect
   it. This is how the Firm learns his taste.
7. **DB** — `reviews`, `findings`, `canon` (1 new entry, provenance = Principal, confidence = certain).

---

## J5 — Ingesting knowledge

1. **P** — Drops a 90-page PDF contract onto the window.
2. **UI** — Drop overlay offers destination and treatment: `Vault only` / `Ingest into Canon` / `Ingest and
   summarize`. Default is Ingest.
3. **S** — Quill takes it: extracts text and structure, chunks semantically (not fixed-size), embeds,
   indexes, extracts candidate Canon facts (parties, dates, obligations, termination terms) each with a
   page citation and a confidence.
4. **UI** — Progress with real stages, not a bar: `Extracting → Structuring → Embedding (612 chunks) →
   Extracting facts (14 candidates)`.
5. **S** — Two candidate facts contradict existing Canon (a renewal date). Contradiction is **not**
   auto-resolved.
6. **UI** — Reconciliation card: old value, new value, both citations, `Keep old / Accept new / Both are
   true in different scopes`.
7. **DB** — `documents`, `chunks`, `canon` (12 accepted, 2 pending reconciliation), `events`.
8. **Unhappy path — scanned PDF with no text layer:** OCR is attempted; if confidence is low, the system
   says which pages are unreadable rather than silently ingesting garbage.

---

## J6 — "Why did we decide that?"

1. **P** — ⌘⇧F, types "refund policy".
2. **UI** — Search Everywhere: results grouped `Decisions (2) · Canon (3) · Artifacts (6) · Minutes (4) ·
   Directives (2)`. Arrow keys move, ⏎ opens, ⌘I previews.
3. **P** — Opens the Decision. Sees: date, decider (Kai, authorized by Principal), options considered,
   criteria and weights, rationale, dissent (Cass objected on margin grounds), reversibility, review date,
   and the supersession chain — this Decision replaced one from March.
4. **P** — Clicks "What changed?" → structural diff of the two Decisions.
5. **Target:** under 60 seconds from keystroke to understanding. This is a hard requirement (J6 in the JTBD
   table, MEM/DE requirements in the PRD).

---

## J7 — Standing automation

**Directive:** "Every Friday at 16:00, review the week's engineering work and tell me what's drifting."

1. **S** — Kai recognizes a recurring intent and produces an **Automation Proposal** instead of a one-off
   Mandate: schedule, participating agents, fence (read-only over Vault + Episodic; no egress; $0.60/run
   ceiling), output (digest notification, not an interrupt), and a kill switch.
2. **UI** — Proposal card with the fence rendered as plain sentences: "It can read your Vault. It cannot
   reach the network. It cannot spend more than $0.60. It will never message anyone."
3. **P** — Authorizes.
4. **S** — First run happens immediately in dry-run mode so the Principal sees the shape of the output
   before trusting the schedule.
5. **S** — Every subsequent run is logged, costed, and cancellable from the Console. Three consecutive
   low-value runs (rated by the Principal or unread twice) trigger a self-review: the Firm proposes
   changing or retiring its own automation.

---

## J8 — Producing a real artifact

1. **P** — "Draft the contractor agreement using our standard terms."
2. **S** — Retrieval finds the template and prior executed agreements in the Vault. Constraints come from
   Canon. Legal-adjacent language triggers a mandatory caveat policy: the Firm drafts, marks it as
   unreviewed by a lawyer, and lists the three clauses that most warrant human legal review.
3. **S** — Artifact written to `Vault/Artifacts/2026/contracts/`, version 1, with front-matter linking
   engagement, sources, and reviewer.
4. **UI** — Vault room: file tree, preview, version history, diff, `Export as DOCX / PDF / Markdown`,
   `Open in default app`, `Reveal in Finder`.
5. **P** — Edits the file externally. File watcher notices, creates version 2, attributes it to the
   Principal, and offers "Have Argus re-review the changes?"

---

## J9 — Cost and control

1. **P** — ⌘K → "Costs".
2. **UI** — Console → Ledger: month-to-date against ceiling, sparkline by day, breakdown by Engagement, by
   agent, by model class, by department. Sortable, exportable to CSV.
3. **P** — Notices Orin is expensive. Opens the agent's page: KPIs, Turns run, average cost per Turn, value
   ratings on its Deliverables, and the routing rules that sent it to the `reasoner` class.
4. **P** — Sets a per-agent cap. The change is a Decision and is recorded.
5. **S** — At 80% of the monthly ceiling the system warns once. At 100% it degrades: only `fast` class runs,
   automations pause, and every Brief carries the constraint at the top. It does not silently stop working
   and it never exceeds the ceiling.
