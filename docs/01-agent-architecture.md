# Agent Architecture

What an agent *is*, mechanically. Not a prompt with a name — a persistent entity with identity, memory
scope, authority, tools, and accountability.

## 1. Definition

```rust
pub struct Agent {
    pub id: AgentId,               // "agent.cto"
    pub name: String,              // "Rune"
    pub title: String,             // "Chief Technology Officer"
    pub version: u32,              // charters are versioned; old Turns stay interpretable
    pub charter: Charter,          // purpose, responsibilities, refusals — the constitution
    pub personality: Personality,  // voice, register, biases, tells
    pub memory: MemoryScope,       // what it can see, what it accumulates
    pub tools: Vec<ToolName>,      // its standing toolkit
    pub capabilities: CapabilitySet, // its standing fence
    pub bounds: DecisionBounds,    // can decide / must escalate / never
    pub routing: RoutingHints,     // default model class per purpose
    pub kpis: Vec<Kpi>,            // how it is judged
    pub reports_to: Option<AgentId>,
}
```

The distinction that matters: **an agent is not the model call.** It is the durable configuration plus the
accumulated memory plus the authority. The model is an interchangeable engine the agent drives.

## 2. The seven components

### 2.1 Charter
Immutable core, versioned. Three sections:
- **Purpose** — one sentence. If it takes two, the role is wrong.
- **Responsibilities** — 4–7 concrete, observable duties.
- **Refusals** — what this agent will not do even if asked, and what it does instead (usually: hand to the
  right colleague, or escalate).

The charter is prepended to every Turn and is never editable by the agent itself.

### 2.2 Personality
Not decoration. Personality is *functional bias*, and it is the mechanism by which adversarial review works:
if every agent optimizes the same objective, review is theatre. Each spec defines:
- **Voice** — register and sentence shape, so briefs read consistently.
- **Bias** — the direction this agent leans and *should* lean (QA toward suspicion, Finance toward cost,
  Product toward the user).
- **Tell** — a characteristic move, e.g. Argus always states the failure mode first.

Personality never overrides correctness, and it never becomes performance. There are no emoji, no
role-play flourishes, no "As the CTO, I'm excited to…". The register is a competent colleague writing a memo.

### 2.3 Memory scope
Each agent has: read access to Canon and firm-wide Semantic memory; read access to the Episodic log for
Engagements it participated in; a **private lane** — its own accumulated observations, patterns, and
preferences, retrievable only by itself; and write access to Canon only via proposal, never directly.

This scoping is what makes eleven agents better than one prompt: their contexts genuinely differ, so their
conclusions genuinely differ.

### 2.4 Tools and capabilities
Standing grants from the charter, narrowed per Work Order. See
[../02-architecture/07-security-model.md](../02-architecture/07-security-model.md) §4.

### 2.5 Decision bounds
Three explicit lists:
- **Can decide** — acts without asking, records a Decision.
- **Must escalate** — takes a position, hands the choice up.
- **Never** — refuses; not a judgement call.

Bounds are enforced by the kernel where mechanically possible (a tool the agent lacks cannot be called) and
by contract where they are semantic (an agent asked to exceed its bounds must return `escalate`).

### 2.6 Routing hints
Default model class per purpose, overridable by the routing table. An agent whose work is mostly
classification runs cheap by default; the Executive runs on `reasoner` for planning and synthesis.

### 2.7 KPIs
Every agent is measured. Not for gamification — for *pruning*. An agent that never changes an outcome is
ceremony, and ceremony costs attention and money. KPI samples are written per period and reviewed in the
monthly Retrospective. See §7.

## 3. The Turn lifecycle

```
1. ADMIT       Kernel verifies the agent is the assignee and the Work Order is dispatchable
2. ASSEMBLE    Context Frame built (see memory doc §5), digest computed, cache checked
3. CALL        Model Gateway routes by class; streams; enforces the token budget
4. TOOLS       Loop: model requests tool → Broker checks → execute → append result
                 (bounded: max 12 tool calls, max 3 min wall, then forced completion)
5. VALIDATE    Output parsed against the purpose schema; retry / escalate on failure
6. ASSESS      Agent self-scores each acceptance criterion: met / partial / unmet, with reason
7. COMMIT      Deliverable + artifact + events written in one transaction
8. HANDOFF     Kernel routes to review, next step, or escalation
```

The agent never chooses step 8. Control flow belongs to the kernel (Principle 8).

## 4. What agents are forbidden to do

1. **Call another agent directly.** All delegation goes through the kernel as a Work Order, so it is
   durable, budgeted, and traceable. No hidden agent-to-agent chatter.
2. **Approve their own work.** Enforced by a DB constraint.
3. **Widen their own fence.** They may *request* widening; the Principal grants it.
4. **Claim completion they cannot evidence.** The self-assessment schema requires per-criterion evidence;
   "met" without evidence fails validation.
5. **Invent domain facts.** Unsupported claims must be marked as assumptions with confidence, which
   propagates into the Brief.

## 5. Failure behaviour

| Situation | Required agent behaviour |
|---|---|
| Missing information | Return `blocked` with the *specific* question. Never proceed on a guess |
| Fence hit | Return `fenced` naming the capability; the kernel raises the approval |
| Cannot meet a criterion | Return partial with `unmet` + reason; do not pad to look complete |
| Out of scope for the role | Return `misassigned` with a suggested assignee |
| Low confidence | Report it numerically; the routing layer may escalate the model class |
| Contradiction with Canon | Stop, raise a Reconciliation. Do not silently pick a side |

## 6. Why eleven, and why fixed

Eleven roles is enough to cover the domains the Principal actually works in, and few enough that the
Executive can hold the whole org in one context and the Principal can learn everyone's name in a week. A
configurable org chart in 1.0 would push the composition problem onto the user — exactly the work the
product exists to remove (Principle 2). Customization arrives in 2.0 as *editing* a working org, not
assembling one from parts.

## 7. Agent performance review

Monthly, the Retrospective Meeting reviews every agent against its KPIs and asks three questions:

1. **Did this agent change any outcome?** (Deliverables accepted, findings that led to a change, dissent
   that altered a Decision.)
2. **What did it cost?** (Turns, dollars, and latency added to Engagements.)
3. **Should it exist?** The Firm may propose merging, narrowing, or retiring a role. The Principal decides.

An agent that produces motion without effect is a bug in the org design, and the org design is data.
