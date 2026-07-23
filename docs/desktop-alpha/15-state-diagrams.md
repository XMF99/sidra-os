# Deliverable 6 — State Diagrams

The shell's runtime state machines. The **mission lifecycle machine is the
engine's** — the UI renders it, it does not own it (`05 §3`). The remaining
machines are UI-plane concerns (data fetching, command dispatch, tail
connection, permission affordance, shell surfaces).

---

## 1. Data surface (per query) — the five-state contract

```mermaid
stateDiagram-v2
  [*] --> Loading: mount / key change
  Loading --> Ready: data resolved
  Loading --> Empty: resolved, no rows
  Loading --> ErrorS: query failed
  Loading --> Degraded: read model MISSING (Epic 0)
  Ready --> Refetching: tail invalidate / manual refresh
  Empty --> Refetching: tail invalidate
  Refetching --> Ready: new data
  Refetching --> Empty: still none
  Refetching --> ErrorS: failed (keep stale shown)
  ErrorS --> Loading: retry
  Degraded --> Loading: backend follow-up lands
  Ready --> [*]: unmount
```

Precedence when multiple apply: `error → degraded → loading(first) → empty →
ready` (`02 §12.4`). Background refetch keeps stale content visible (never
blanks).

---

## 2. Command / mutation lifecycle

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Submitting: dispatch command(correlationId)
  Submitting --> OptimisticApplied: onMutate patch (opt-in)
  OptimisticApplied --> Confirmed: tail event matches correlationId
  Submitting --> Confirmed: ok (no optimistic)
  Submitting --> Denied: PermissionDenied
  OptimisticApplied --> Denied: PermissionDenied
  Submitting --> Failed: service error
  OptimisticApplied --> Failed: service error
  Denied --> Idle: explain dialog, rollback, no state change
  Failed --> Idle: toast + correlationId, rollback
  Confirmed --> Idle: invalidate affected keys
```

Denial is **not** an error path — it rolls back and explains (ADR-0085).
Confirmation is authoritative only once the matching tail event arrives.

---

## 3. Event-tail connection (freshness engine)

```mermaid
stateDiagram-v2
  [*] --> Connecting
  Connecting --> Live: subscribed
  Live --> Applying: EventEnvelope received
  Applying --> Live: invalidate mapped query keys
  Live --> Reconnecting: tail dropped
  Reconnecting --> IntervalFallback: start interval revalidation + status "reconnecting"
  IntervalFallback --> Live: reconnected → full invalidation sweep
  Reconnecting --> Live: reconnected → full sweep
```

Tail loss never loses data (the log is intact); it only degrades freshness to
polling until reconnect (`08 §4`, `10 §9`).

---

## 4. Permission affordance (per gated action)

```mermaid
stateDiagram-v2
  [*] --> Resolving: read permissions.forActor
  Resolving --> Enabled: broker would allow
  Resolving --> DisabledReason: recoverable deny (needs seat/delegation)
  Resolving --> Hidden: structurally irrelevant
  Resolving --> ExplainOnAttempt: ambiguous/expensive to pre-check
  DisabledReason --> Enabled: seat/delegation event → invalidate → re-resolve
  Enabled --> Denied: dispatch anyway → broker denies at runtime
  ExplainOnAttempt --> Denied: dispatch → broker denies
  ExplainOnAttempt --> Enabled: dispatch → broker allows
  Denied --> DisabledReason: show explanation
```

Even `Enabled` re-checks server-side on dispatch — the UI state is a prediction,
never the enforcement (ADR-0085/0006).

---

## 5. Mission lifecycle (engine-owned; UI renders)

```mermaid
stateDiagram-v2
  [*] --> Draft: mission.create (wizard)
  Draft --> AwaitingApproval: submitted
  AwaitingApproval --> Running: approve (non-author approver, SoD)
  AwaitingApproval --> Rejected: deny
  Running --> Blocked: engine block
  Blocked --> Running: resolve (engine)
  Running --> Completed: engine — tasks satisfied + evidence
  Running --> Failed: engine fault
  Failed --> Running: retry (if engine permits)
  Running --> Cancelled: cancel
  AwaitingApproval --> Cancelled: cancel
  Completed --> [*]
  Rejected --> [*]
  Cancelled --> [*]
```

The UI offers a transition control **only** when the DTO reports the transition
valid **and** the broker would allow it. `approve` from `AwaitingApproval` is
shown-disabled for the author (SoD, ADR-0008/0018/0060). Blocked/Failed are
engine-driven; the UI reflects them.

---

## 6. Shell surface (overlay) machine

```mermaid
stateDiagram-v2
  [*] --> Page
  Page --> Palette: ⌘K
  Page --> Search: ⌘/
  Page --> Notifications: ⌘⇧N
  Page --> Dialog: action needs confirm
  Palette --> Page: Esc/Back/select
  Search --> Page: Esc/Back/select
  Notifications --> Page: Esc/Back
  Dialog --> Page: confirm/cancel
  note right of Dialog: Overlays form a stack;\nEsc/Back closes the TOP overlay\nbefore popping the page (02 §2)
```

---

## Diagram-to-spec map

| Diagram | Governed by |
|---|---|
| Data surface | `02 §12`, `08 §4` |
| Command lifecycle | `01 §4`, `08 §5`, ADR-0085 |
| Event tail | `01 §7`, `08 §9`, `10 §9` |
| Permission affordance | ADR-0085/0006 |
| Mission lifecycle | `05 §3`, engine (M15) |
| Overlay | `02 §2`, `09 §4` |
