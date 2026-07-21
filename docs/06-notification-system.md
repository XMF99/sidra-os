# Notification System

The notification system's job is to protect the Principal's attention, not to spend it. Its default answer
is silence.

## 1. Urgency ladder

| Level | Meaning | Delivery | Budget |
|---|---|---|---|
| `interrupt` | Work cannot continue without him | OS notification + in-app modal + Dock badge | ≤3/day, hard cap |
| `surface` | He would want to know within the hour | Dock badge + Lobby item; no OS notification | ≤10/day |
| `batch` | Belongs in the next Brief | Morning Brief or Engagement Brief | unbounded |
| `silent` | Recorded only | Console and Archive | unbounded |

Everything defaults to `batch`. Promoting to `surface` or `interrupt` requires a rule below — no agent
decides its own urgency.

## 2. What may interrupt

Exactly five things:

1. An **Approval Request** blocking active work the Principal asked for.
2. A **Reconciliation** — Canon contradicts itself, so downstream answers are now unreliable.
3. **Budget at 100%** of the monthly ceiling.
4. A **failure that lost work** the Principal was waiting on.
5. Anything he has explicitly asked to be told immediately.

Nothing else. Not completion, not progress, not a new finding, not an automation result. Completion of work
he is watching updates the Stage; completion of work he is not watching goes in a Brief.

## 3. Batching

Approvals batch aggressively. If three agents hit fences within a 90-second window, the Principal sees one
sheet with three items and one keystroke to grant all, not three modals. Batching windows: approvals 90 s,
surfaces 10 min, everything else until the next Brief.

## 4. Focus mode

`⌘⇧D` enters Focus. In Focus, `interrupt` is downgraded to `surface`, work that requires approval pauses
and queues rather than blocking, and the Dock stops animating. On exit, the Principal gets one consolidated
card: *"While you were focused: 2 approvals waiting, 1 Engagement paused, 3 items for the Brief."*

Focus is automatic during any Engagement the Principal explicitly opened and is watching — the system does
not interrupt him about one thing while he is reading another.

## 5. Anatomy of a notification

Every notification must have a **decision attached**. If there is nothing to decide, it is not a
notification; it is a record.

```
Title      ≤60 chars, states what happened, not what the system did
Body       ≤160 chars, states what it means and what is needed
Action     the primary command, one keystroke
Secondary  dismiss, snooze, or open the trace
Source     the agent, and a link to the trace
```

Copy rules: no "Success!", no "Oops", no exclamation marks. State the fact. "Rune needs network access to
docs.stripe.com to finish the comparison." Not "Approval needed!"

## 6. Snooze and defer

Snoozing is real: it sets a wake time and the item genuinely disappears until then. Defer moves an item into
the next Brief. Both are recorded, and the Firm learns from the pattern — an item deferred three times is
either not important or badly framed, and Kai says so.

## 7. Delivery channels

1.0 ships in-app plus native OS notifications (macOS Notification Center, Windows Toast, Linux
`org.freedesktop.Notifications`). OS notifications are used only for `interrupt`, and never contain
sensitive content — they say a decision is needed and name the agent, nothing more. There is no email, no
push, no third-party channel, and no way for an automation to reach the Principal outside the app in 1.0.

## 8. Measurement

Tracked, locally: interrupts per day, time from interrupt to response, dismissal rate, and the proportion of
notifications acted upon. Rising dismissal is the canary for the whole system — it means the Firm is
spending attention it has not earned. The monthly Retrospective reviews it and tightens the rules if needed.

Target: ≤3 interrupts/day, ≥70% acted upon, and a dismissal rate below 20%.
