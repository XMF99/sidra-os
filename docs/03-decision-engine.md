# Decision Engine

Decisions are first-class records, not chat messages. The system's long-term value comes less from what it
produces than from what it can explain.

## 1. What counts as a Decision

Recorded when any of these are true:

- It changes direction (scope, architecture, positioning, priority).
- It commits resources (money, a dependency, a schedule).
- It is hard to reverse (class 2 or 3).
- It overrides someone (a veto, a dissent, a prior Decision).
- The Principal made a choice the Firm should remember.

Not recorded: routine implementation choices inside an agent's authority, or anything with no future
consequence. Over-recording is as harmful as under-recording — a log of 400 trivial "decisions" is
unsearchable and destroys the value of the ten that matter.

## 2. Anatomy

```yaml
id:            dec_01J8ZM…
title:         "Use Stripe Billing rather than building metering"
question:      "How do we meter and bill usage for the next 12 months?"
criteria:                        # recorded BEFORE options were scored
  - {name: "time to first revenue", weight: 0.35}
  - {name: "total cost at 3 revenue scenarios", weight: 0.30}
  - {name: "exit cost", weight: 0.25}
  - {name: "operational burden", weight: 0.10}
options:
  - id: o1  label: "Stripe Billing"     pros: [...]  cons: [...]  evidence: [art_…, chunk_…]
  - id: o2  label: "Build metering"     pros: [...]  cons: [...]  evidence: [...]
  - id: o3  label: "Defer to Q1"        pros: [...]  cons: [...]  evidence: [...]
chosen:        o1
rationale:     "Two weeks to revenue vs six; exit cost bounded at ~3 weeks of migration work
                because usage events are stored in our own schema first."
decided_by:    agent.exec
authority:     escalated        # delegated | escalated | principal
reversibility: 2                # 1 trivial · 2 costly but possible · 3 one-way door
confidence:    0.78
review_at:     2027-01-21
review_trigger: "MRR > $40,000"   # optional, becomes an automation trigger
dissents:
  - {agent: agent.finance, position: "Fees exceed build cost above $120k ARR; the crossover
     is closer than the model implies."}
supersedes:    dec_01J7…
```

## 3. Reversibility classes

| Class | Meaning | Process |
|---|---|---|
| 1 | Trivially reversible | Any agent within its bounds decides and records |
| 2 | Reversible at real cost | Requires stated criteria, a considered alternative, and a review date |
| 3 | One-way door | Requires the Principal, a Decision Forum, and an explicit "what would make this wrong" section |

Class is assessed at framing time, not after. Misclassification is itself a finding Argus checks for.

## 4. Criteria-first

Criteria and weights are persisted **before** options are scored, in a separate transaction with its own
event. The Decision Forum protocol enforces this. The reason is that the dominant failure mode of
reasoning systems — human and artificial — is picking the answer and then constructing criteria that
justify it. Making criteria immutable-once-set converts that from a temptation into an impossibility.

If new information genuinely requires new criteria, the criteria are amended with a recorded reason and the
amendment is visible in the record.

## 5. Confidence and "what would change this"

Every Decision carries a numeric confidence and, for class 2 and 3, a required field: **what evidence would
change this decision.** That field is what makes review dates useful — at review time, the Firm checks
specifically whether that evidence has appeared, instead of re-litigating from scratch.

## 6. Review and supersession

- `review_at` schedules an automation trigger. At review, the Firm checks the falsifier field and reports:
  *hold*, *revisit*, or *reverse*, with evidence.
- `review_trigger` binds a Decision to a threshold (a metric, a date, an event). This is how the Firm keeps
  its own promises — "re-evaluate at $40k MRR" is otherwise a sentence nobody ever reads again.
- Superseding creates a new Decision linked to the old one. The old one is never edited. The Archive renders
  the chain, so "why did we decide X, and then not-X?" is one view.
- Revocation (`status: revoked`) is for decisions that should never have been made; it requires a reason.

## 7. Dissent

Recorded verbatim, attributed, and permanent. Dissent appears:
- In the Minutes of the meeting.
- In the Decision record.
- In the Brief's Findings section, named.
- At review time, checked first: "Cass dissented on fee crossover; here is what actually happened."

Dissent that turns out to be right is the highest-value signal the Firm produces about its own reasoning,
and it is tracked per agent as a quality metric.

## 8. The Principal's role

He can: record a Decision directly (`authority: principal`), override any Decision (recorded, with the prior
one superseded), demand a Forum, or set a review trigger. He cannot silently edit a Decision record — an
amendment is a new version with a reason. This constraint applies to him too, because the value of the
archive depends on nobody being able to rewrite it, including its owner.

## 9. Surfaces

| Where | What it shows |
|---|---|
| Boardroom → Decisions | All active Decisions, by reversibility and review date |
| Archive | Full history including superseded, with chains |
| Inspector | The Decision that authorized whatever is selected |
| Morning Brief | Decisions due for review this week |
| Search Everywhere | Decisions as a first-class result type |
