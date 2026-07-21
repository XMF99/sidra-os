# Principles

Ten laws. Every design decision in this document set defers to them. When a trade-off is unclear, the
lower-numbered principle wins.

---

### 1. The Principal's attention is the scarcest resource in the system

Every feature must be justified by attention saved, not capability added. A capability that requires
supervision to be safe has a negative budget. The correct default output of a four-hour agent run is one
page, not forty. Corollaries: no notification without a decision attached; no dashboard that must be
watched; no feed that must be scrolled.

### 2. Delegation over prompting

The interaction model is *state an outcome, receive a brief*. The Principal should never need to know which
agent, which model, which tool, or which prompt. Any place in the UI where he must choose a mechanism is a
design failure to be logged and removed. Expert affordances exist — direct-address, forced routing — but
they are shortcuts, never the path.

### 3. Nothing important is ephemeral

Every decision, artifact, message, and tool call is written to a durable, queryable, human-readable store
before it is shown. A conversation is a *view over records*, not the record itself. If the process is killed
mid-run, the work resumes; nothing exists only in a context window.

### 4. Legibility is a feature, not a debug mode

Any output can be expanded into: which agent, on whose authority, using which model, at what cost, reading
which sources, under which decision. This chain is available to the Principal in one keystroke, always, in
the shipping build. Systems you cannot inspect, you cannot delegate to.

### 5. Separation of powers

The agent that produces work never approves it. The agent that plans never solely executes. Quality
Assurance can block a release; Finance can block a spend; the Executive can override either, but the
override is recorded as a decision with a rationale. Adversarial review by a differently-motivated agent is
the single highest-leverage correctness mechanism available, and it is structural, not optional.

### 6. Bounded autonomy, hard fences

Agents act freely inside an explicit capability grant and stop dead at its edge. The fence is enumerated,
not inferred: network egress allowlist, filesystem scope, spend ceiling, irreversibility class. Crossing a
fence produces an Approval Request, never a best guess. The Principal can widen a fence permanently, for a
session, or once.

### 7. Local-first, sovereign data

The vault is a directory on the Principal's machine: SQLite plus Markdown plus original files. It is
encrypted at rest, readable without this application, and never leaves the device except as model inference
payloads to endpoints the Principal has explicitly enabled. No telemetry, no analytics, no account. Offline,
everything except inference continues to work.

### 8. Determinism where possible, intelligence where necessary

Orchestration, routing, retries, permissions, scheduling, and state transitions are ordinary deterministic
code and can be unit-tested. Language models are used for judgment, drafting, and synthesis — inside
typed boundaries with schema-validated outputs. Never let a model decide something a switch statement can
decide correctly.

### 9. Honest uncertainty

The system distinguishes *knows*, *inferred*, and *assumed*, and marks which is which in its output. It
reports what it could not do and why. An agent that cannot meet acceptance criteria returns a partial
result with a stated gap; it does not invent completion. Confidence is displayed, and low confidence is not
hidden by fluent prose.

### 10. The building must feel real

Craft is a functional requirement. Frame budget, motion coherence, typographic discipline, and copy quality
determine whether the Principal delegates seriously or plays with a toy. 60 fps or explicitly degraded;
every state designed including empty, loading, partial, error, and stale; every string written by a person
with taste. Never a placeholder. Never a lorem. Never a spinner where a plan would do.

---

## Applying the principles

Use this table when a decision is contested.

| Tension | Resolution | Principle |
|---|---|---|
| More agent output vs. shorter brief | Shorter brief; detail lives one keystroke away | 1, 4 |
| Let the Principal pick the model vs. auto-route | Auto-route; expose override in Settings only | 2 |
| Stream tokens vs. persist first | Persist first, then stream the view | 3 |
| Faster single-agent answer vs. reviewed answer | Reviewed, unless the task is classed Trivial | 5 |
| Convenient broad file access vs. scoped grant | Scoped grant with one-tap widening | 6 |
| Cloud sync convenience vs. local vault | Local vault; sync is an opt-in 2.0 plugin | 7 |
| LLM chooses next step vs. state machine | State machine; LLM fills the node, not the graph | 8 |
| Confident tone vs. flagged assumption | Flagged assumption, always | 9 |
| Ship a rough screen vs. cut the feature | Cut the feature | 10 |
