# Communication Protocol

How agents talk. Not free-form chat — typed messages through the kernel, so everything is durable,
budgeted, and traceable.

## 1. The rule

**Agents never call each other.** Every inter-agent communication is a kernel-mediated record. There is no
hidden channel, no side conversation, no unlogged coordination. This costs a little latency and buys
complete auditability, resumability, and the ability to reconstruct why any output exists.

## 2. Message envelope

Every message shares one envelope:

```json
{
  "id": "msg_01J8...",
  "ts": 1753100000000,
  "engagement_id": "eng_01J8...",
  "from": "agent.exec",
  "to": "agent.eng",
  "kind": "work_order",
  "in_reply_to": "msg_01J8...",
  "trust": "firm",
  "body": { }
}
```

`trust` is carried on every message and every context item: `principal` > `firm` > `agent` > `untrusted`.
Untrusted content can never be promoted by an agent's assertion; only the Principal can promote trust.

## 3. Message kinds

| Kind | From → To | Purpose | Required fields |
|---|---|---|---|
| `work_order` | Kai / head → agent | Assign work | instruction, inputs, acceptance, grant, budget, deadline |
| `deliverable` | agent → kernel | Return work | summary, artifact?, assessment[], confidence, gaps[] |
| `review` | reviewer → kernel | Verdict on a deliverable | verdict, findings[] |
| `question` | agent → issuer | Request specific missing information | question, why_it_blocks, options? |
| `answer` | issuer → agent | Respond | answer, source |
| `escalation` | agent → head → Kai | Hand up a blocked decision | reason, tried[], position, options[] |
| `approval_request` | agent → Principal (via kernel) | Cross a fence | ask, detail, cost, consequence_of_no |
| `position` | agent → meeting | Stance in a deliberation | stance, argument, evidence[] |
| `dissent` | agent → decision | Recorded disagreement | position (verbatim) |
| `proposal` | agent → Principal | Suggest a Canon entry, Playbook, or routing change | proposal, evidence, effect |
| `brief` | Kai → Principal | The synthesis | situation, actions, findings, recommendation, ask, cost |

Closed enum. Adding a kind requires an ADR — this prevents the protocol degrading into free text.

## 4. Work Order contract

The most important message in the system.

```yaml
title:        "Draft the API section of the invoicing spec"
instruction:  |
  Outcome wanted, not method. State the interfaces the contractor would need
  to implement, with request/response shapes and error cases.
inputs:
  - artifact: art_01J8...          # the product spec, §1–3
  - canon: ["billing.currency", "billing.tax_handling"]
  - chunk: [chk_..., chk_...]      # explicitly resolved, not "search for it"
acceptance:
  - id: a1  text: "Every endpoint has request, response, and error shapes"        checkable: true
  - id: a2  text: "No endpoint requires production credentials to implement"      checkable: true
  - id: a3  text: "Idempotency behaviour is specified for all mutating calls"     checkable: true
grant:        ["fs.read:vault/Artifacts/**", "mem.read"]
budget_cents: 25
deadline:     2026-07-21T14:00:00Z
reviewer:     agent.qa
```

Rules:
1. **Outcome, not method.** If the instruction specifies how, the issuer has done the specialist's thinking
   and the specialist's perspective is wasted.
2. **Inputs are resolved references**, never "look for the relevant docs". Resolution is the issuer's job.
3. **Acceptance criteria must be independently checkable**, or the reviewer cannot do its job. Iris is held
   to this by KPI.
4. **The grant is minimal** and narrower than the assignee's standing fence.
5. **The reviewer is named at creation.** Review is not an afterthought.

## 5. Question protocol

Agents ask questions rather than guessing — but a question is expensive, so it is constrained:

- It must name **what it blocks**. "I need more context" is invalid; "I cannot specify the refund window
  without knowing whether partial refunds are pro-rata" is valid.
- It must offer **options** where options exist, so the answer can be one word.
- It is routed to the **issuer first**, who must attempt to answer from Canon before passing it to the
  Principal. Most questions die here, which is the point.
- Maximum one open question per Work Order at a time. Batch or proceed with a stated assumption.

## 6. Escalation protocol

```
specialist ──► department head ──► Kai ──► Principal
```

Each hop must include: what was tried, why it is blocked, the escalating agent's own recommended position,
and what happens if nothing is decided. An escalation without a position is returned — "I don't know, you
decide" is not an escalation, it is an abdication.

Escalations carry a deadline. An unanswered escalation at its deadline degrades: the recommended position
becomes the default, the Engagement continues, and the Brief states plainly that it proceeded on an
unanswered escalation. Silence never blocks forever, and never passes silently.

## 7. Register and style

All agents write to the same standard, differing in bias, not in decorum:

- Plain declarative sentences. No preamble, no "Certainly", no restating the question.
- No emoji. No exclamation marks. No role-play flourishes.
- Uncertainty as a number or a range, never as hedging language.
- Attribution and sources inline: agents cite chunk and Canon ids, which the UI renders as citations.
- Disagreement stated directly, addressed to the position, never to the agent.
- Length proportional to stakes. A `pass` review is one line.

## 8. Anti-patterns

| Anti-pattern | Why it is banned |
|---|---|
| Agents complimenting each other | Pure token cost; corrodes adversarial review |
| "As the CTO, I believe…" | The role is in the envelope; stating it is theatre |
| Restating the work order back | The kernel has it |
| Vague blocking ("need more info") | Unactionable; wastes a round trip |
| Escalating without a position | Pushes the work back up the chain |
| Multi-topic messages | Breaks the one-order-one-thread model and defeats tracing |
| Direct agent-to-agent calls | Unlogged, unbudgeted, unresumable |

## 9. Cost of the protocol

Every message is tokens. The protocol is deliberately terse for that reason: Work Orders reference inputs by
id rather than inlining them; reviews return findings, not restatements; positions in meetings are capped in
length by round. Measured target: protocol overhead ≤15% of total Engagement tokens. Orin tracks it, and if
it exceeds 20% the Retrospective examines which message kinds are bloating.
