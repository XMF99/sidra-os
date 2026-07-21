# Meeting Engine

Structured multi-agent deliberation. A Meeting exists when the answer depends on *disagreement being
surfaced* — otherwise it is a Work Order and should stay one.

## 1. When to convene

| Convene a Meeting | Do not |
|---|---|
| A choice with stakes ≥ medium and more than one defensible option | A task with one correct answer |
| Two Deliverables contradict | A question answerable from Canon |
| A design needs multiple perspectives before it is built | Status reporting (that is the Standup) |
| Something failed and the cause is not obvious | Ceremony because it feels organizational |

Kai must justify convening a Meeting in the Mandate. Meetings are the most expensive mechanism in the
system and the easiest to overuse.

## 2. Meeting kinds

| Kind | Chair | Attendees | Rounds | Required output |
|---|---|---|---|---|
| `standup` | Kai | Department heads | 1 | Morning Brief |
| `design_review` | Iris | Mira, Argus, relevant specialist | 2 | Findings + revision orders |
| `decision_forum` | Kai | Position-holders + Argus as devil's advocate | 3 | Decision + Dissents |
| `post_mortem` | Rune | Involved agents | 2 | Timeline, causes, one preventive change |
| `retrospective` | Kai | All | 2 | Agent KPI review + org proposals |
| `planning` | Iris | Relevant heads | 2 | Sequenced Work Orders |
| `incident` | Atlas | Whoever is needed | 1 | Timeline + immediate mitigation |

Every Meeting produces **Minutes** and at least one Decision or Work Order. A Meeting that produces nothing
is logged as such and counts against the chair's KPI.

## 3. Protocol

```
1. FRAME      Chair states the question, the criteria, and their weights — BEFORE any position is heard.
              Criteria are persisted first. This is the single most important step: it prevents
              post-hoc rationalization of a conclusion someone already liked.
2. POSITION   Each attendee states a position with evidence, in parallel, without seeing the others.
              Parallel-blind is deliberate: it prevents anchoring on whoever speaks first.
3. EXCHANGE   Positions are revealed. Each attendee may revise, concede, or sharpen — with a reason.
              Round-capped (default 2, max 3).
4. CHALLENGE  Argus argues the strongest case against the leading option. Mandatory in decision_forum.
5. RESOLVE    Chair scores options against the pre-stated criteria, states the outcome, and records
              every unresolved disagreement as a Dissent, verbatim.
6. MINUTE     Minutes written: attendees, criteria, positions, exchange summary, outcome, dissents,
              follow-up Work Orders. Mirrored to Vault/Records/minutes.
```

## 4. Convergence and cost control

| Control | Rule |
|---|---|
| Round cap | Hard maximum 3. At the cap the chair decides on the evidence available and says so |
| Budget cap | Set at convening; exceeding it forces resolution in the current round |
| Speaking budget | Position ≤300 tokens, exchange ≤200 tokens per round. Enforced by contract |
| No-new-argument rule | If a round introduces no new evidence, the meeting closes early |
| Quorum | A Meeting needs ≥2 attendees plus the chair; otherwise it is a Work Order |
| Consensus is not required | The chair decides. Dissent is recorded, not resolved |

**Averaging is forbidden.** If Iris says ship and Cass says wait, the outcome is one of those, plus a
recorded dissent — never "ship a smaller version" invented by the chair to keep the peace, unless that was
an explicitly framed option.

## 5. Blind positioning

Positions in step 2 are generated in parallel Turns with no visibility of each other. Implementation: all
position Turns dispatch simultaneously; none receives the meeting transcript in its context frame, only the
framing and the shared evidence. Anchoring is the dominant failure mode of sequential multi-agent
deliberation, and this removes it structurally rather than by instruction.

## 6. Minutes

```markdown
---
meeting: MTG-0117
kind: decision_forum
chair: Kai
date: 2026-07-21T11:04Z
attendees: [Iris, Vega, Cass, Argus]
cost_cents: 61
---
## Question
Should billing integration be contracted out?

## Criteria (stated before positions)
1. Principal's attention saved (weight 0.4)
2. Total cost over 3 months (0.3)
3. Reversibility (0.2)
4. Calendar time (0.1)

## Positions
- **Vega** — for, scoped to provider integration. 60 h, clean interface boundary. [ev: art_…]
- **Cass** — for, with a cash-timing caveat: month 2 exceeds the ceiling. [ev: model_…]
- **Iris** — against for pricing logic; it encodes product decisions. [ev: dec_0031]
- **Argus** — challenge: cutting the feature entirely dominates on criteria 1 and 2.

## Exchange
Vega conceded Iris's boundary. Cass's caveat became a constraint. Argus's alternative was
scored and rejected on criterion 1 — the feature is a prerequisite for the Q4 commitment.

## Outcome
Contract out the provider integration only; keep pricing logic in-house. Cap 60 h.

## Dissents
- **Argus** — "The strongest option remains not building this quarter. The Q4 commitment is
  self-imposed and could be moved at no external cost."

## Follow-ups
- WO: Vega — write the interface boundary spec (due 07-22)
- Decision DEC-0042 recorded; review 2026-10-21
```

Minutes are always written, always mirrored to Markdown, and always linked from any Decision they produced.

## 7. The Principal in meetings

He may watch live in the Boardroom (attendee cards, live stance chips, the criteria matrix filling in), but
watching is never required. He may inject a position at any point — a Principal position carries `trust:
principal` and outranks all others, and the chair must address it explicitly. He may also close a Meeting
early and take the decision himself, which is recorded as `authority: principal`.

## 8. Anti-theatre

Meetings are the feature most likely to become expensive performance. Guards:

1. Kai must state, in the Mandate, what disagreement the Meeting is expected to surface.
2. A Meeting where all positions agree in round 1 closes immediately, and that fact is recorded — repeated
   unanimous meetings mean the trigger threshold is wrong.
3. Minutes record cost. A Retrospective reviews meeting cost against decisions changed.
4. The Standup is capped at one round and a fixed budget, because it runs 365 times a year.
