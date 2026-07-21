# AI Routing Strategy

The Principal never chooses a model. The Model Gateway does, deterministically, from the shape of the work.

## 1. Model classes

Vendor names never appear in agent code or charters. Agents request a **class**; the gateway binds a class
to a concrete model at call time from configuration.

| Class | Used for | Latency budget | Relative cost | Bound to (1.0 default) |
|---|---|---|---|---|
| `reasoner` | Mandate formation, architecture, decision forums, adversarial review, synthesis | ≤60 s | 1.0× | Frontier reasoning model |
| `worker` | Drafting, structured extraction, code, most Work Orders | ≤25 s | 0.2× | Mid-tier model |
| `fast` | Classification, routing, formatting, short answers, triage | ≤4 s | 0.03× | Small fast model |
| `embed` | Vectorization | ≤2 s/batch | 0.002× | Embedding model |
| `vision` | Image and scanned-page understanding | ≤20 s | 0.3× | Multimodal model |

Binding lives in `firm.toml` and can be changed without touching agent definitions. A model deprecation is a
config change, not a refactor. Local models slot in as alternate bindings in 2.0.

## 2. Routing inputs

Routing is a pure function of six observable inputs — no model decides the route:

```
route(purpose, complexity, stakes, context_size, remaining_budget, latency_mode) → (class, params)
```

| Input | Values | Source |
|---|---|---|
| `purpose` | classify, plan, draft, review, synthesize, extract, answer | The Turn |
| `complexity` | trivial, standard, deep, program | Classifier (see §4) |
| `stakes` | low, medium, high | Mandate reversibility + Decision presence |
| `context_size` | tokens after assembly | Context builder |
| `remaining_budget` | cents | Budget ledger |
| `latency_mode` | interactive, background | Priority of the Engagement |

## 3. The routing table

Read top to bottom; first match wins.

| # | Condition | Class | Params |
|---|---|---|---|
| 1 | `purpose = classify` or `extract` with a rigid schema | `fast` | temp 0, max 512 |
| 2 | `purpose = embed` | `embed` | — |
| 3 | input contains an image or scanned page | `vision` | temp 0.2 |
| 4 | `complexity = trivial` and `stakes = low` | `fast` | temp 0.3 |
| 5 | `purpose = plan` (Mandate formation) | `reasoner` | temp 0.4, extended thinking on |
| 6 | `purpose = review` and `stakes ≥ medium` | `reasoner` | temp 0.2, extended thinking on |
| 7 | `purpose = synthesize` (Brief) | `reasoner` | temp 0.5 |
| 8 | `stakes = high` (irreversibility class 3, or spend, or external-facing) | `reasoner` | temp 0.3 |
| 9 | `remaining_budget < 20%` of period ceiling | downgrade one class, mark Brief "reduced" | |
| 10 | `latency_mode = interactive` and estimated latency > 8 s | try `worker` first, escalate on low confidence | |
| 11 | default | `worker` | temp 0.6 |

Every routing decision is logged on the Turn with the rule number that fired, so any cost can be explained
by pointing at a row in this table.

## 4. Complexity classification

The first Turn of every Engagement is a `fast`-class classifier producing:

```json
{ "complexity": "trivial|standard|deep|program",
  "domains": ["product","engineering","finance"],
  "artifact_expected": "answer|document|dataset|code|decision",
  "reversibility": 1,
  "estimated_orders": 3,
  "needs_clarification": false,
  "clarifying_questions": [] }
```

| Complexity | Definition | Staffing | Typical cost |
|---|---|---|---|
| `trivial` | Answerable from memory or one lookup; no artifact | **No staffing.** One Turn, answer directly, no Mandate ceremony | <$0.01 |
| `standard` | One artifact, one or two domains | 1–3 Work Orders + 1 review | $0.05–$0.50 |
| `deep` | Research or a decision with real stakes | 3–6 Work Orders + Meeting + review | $0.50–$3 |
| `program` | Multi-session, multi-artifact, spans days | Workflow with checkpoints and standing Work Orders | budgeted explicitly |

**The trivial fast lane is the single most important cost and latency control in the system.** Without it,
the organizational ceremony that makes hard work good makes easy work absurd. Target: >50% of Directives
resolve in the fast lane, in under 3 seconds, for under a cent.

## 5. Prompt and cache strategy

- **Layered prompts**: `[system: firm invariants] [system: agent charter] [system: output contract]
  [user: situation + retrieved context] [user: instruction]`. The first three layers are stable per agent
  and are ordered first to maximize provider prefix caching.
- **Cache measurement**: `cached_tokens` is recorded per Turn; cache hit rate is a Console metric. A drop in
  hit rate is a regression, because it means charters or contracts are being rebuilt unnecessarily.
- **Context discipline**: retrieval is capped at 40% of the frame and every included item must earn its
  place with a score above a floor. Padding context with "everything relevant" degrades quality *and*
  raises cost; the retriever prefers 8 excellent chunks over 40 mediocre ones.

## 6. Budget enforcement

Three nested ceilings, all enforced in the gateway before the request leaves the process:

| Scope | Default | Behaviour at limit |
|---|---|---|
| Turn | derived from Work Order budget | Truncate max_tokens; if insufficient, fail the Turn with `budget_exceeded` and escalate |
| Engagement | set in the Mandate, visible to the Principal | Pause and raise an Approval Request: "continue for another $X?" |
| Period (month) | $150 | 80% → one warning; 100% → `fast` class only, automations paused, constraint stated at the top of every Brief |

Estimation happens before the call (tokens × class rate) and reconciliation after (actual usage). Drift
between estimate and actual is tracked; consistent underestimation is a bug and is surfaced in the Console.

## 7. Failure and escalation

| Failure | First response | Then | Finally |
|---|---|---|---|
| Timeout | Retry once, same class, +50% timeout | Reroute to a different provider binding | Escalate the Work Order |
| Rate limit / 429 | Exponential backoff with jitter, 3 attempts | Reroute to alternate binding | Queue and notify if interactive |
| Schema violation | Re-prompt with the validator error | Escalate one class | Escalate to the department head |
| Refusal by the model | Log verbatim; re-frame once with explicit legitimate context | If it persists, surface to the Principal honestly — never route around a genuine safety refusal | — |
| Low self-reported confidence (<0.5) | Escalate one class and retry | Add a review step | Return a partial with a stated gap |
| Provider outage | Failover binding | Degrade to `fast` | Queue Turns, continue all local work, tell the Principal |

**Never**: silently substitute a weaker model on a high-stakes Turn; retry an effectful tool call without an
idempotency check; hide a refusal behind a fabricated answer.

## 8. Quality feedback loop

Routing is not static. The system records, per (purpose, complexity, class): acceptance rate of
Deliverables, review verdict distribution, rework rate, cost, and latency. The Night Shift produces a
weekly routing report. If `worker` achieves ≥95% of `reasoner`'s acceptance rate at 20% of the cost for a
given cell, the Firm proposes a routing change as a Decision for the Principal to approve. Routing changes
are never automatic — Principle 6.

## 9. Privacy controls

- Per-provider enablement; a disabled provider is never contacted.
- `local_only` mode (2.0) restricts routing to local bindings and marks any capability that becomes
  unavailable.
- Content classes can be pinned: e.g. anything tagged `sensitive` in Canon may be restricted to a specific
  provider or to local inference only, enforced in the gateway, not by prompt instruction.
- No prompt or completion is ever sent anywhere except the bound provider endpoint. There is no telemetry.
