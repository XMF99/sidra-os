# Automation Engine

Standing initiative inside a hard fence. This is where Sidra OS stops being a tool you use and becomes an
organization that works.

## 1. Trigger kinds

| Kind | Spec | Example |
|---|---|---|
| `schedule` | cron + IANA timezone | Standup at 06:45 local, Night Shift at 02:00 |
| `event` | filter over the event stream | On `decision.review_due`, convene a review |
| `file_watch` | glob over the Vault | New file in `Sources/inbox/**` → ingest and summarize |
| `threshold` | predicate over a metric | `mrr > 40000` → revisit DEC-0042 |
| `manual` | none | A saved Playbook run on demand from ⌘K |

All triggers are rows in `triggers`, all runs in `trigger_runs`, all fenced, all costed, all cancellable.

## 2. Scheduling correctness

Schedules are a classic source of silent bugs. Rules:

- Times are stored as cron + IANA zone, never as UTC offsets. DST is resolved at evaluation.
- A skipped occurrence (machine asleep, app closed) is detected on wake. Policy per trigger:
  `run_once_on_wake` (default for daily digests), `skip` (for time-sensitive things), or `run_all` (rare).
- Catch-up runs are marked as late in their output, so a 09:00 Morning Brief says it is late rather than
  pretending it is 06:45.
- Jitter of ±3 minutes on non-critical schedules avoids thundering herds against providers.
- Overlap protection: a trigger never runs concurrently with itself; a still-running instance causes the
  next to skip with a logged reason.

## 3. Fences

Every automation carries an explicit fence, presented to the Principal in plain sentences at creation:

```yaml
capabilities: ["mem.read", "fs.read:vault/**"]
spend_ceiling_cents: 60
egress: []                        # empty = no network at all
effect_max: 2                     # never irreversible
output: digest                    # digest | interrupt | artifact | silent
kill_switch: true
```

Rendered as:
> It can read your Vault and the Firm's memory. It cannot reach the internet. It cannot spend more than
> $0.60 per run. It will never send anything to anyone. It writes a digest; it will not interrupt you.
> You can stop it at any time.

An automation can never widen its own fence. A run that hits its fence stops and reports; it does not raise
an interactive approval at 02:00 — it queues the request for the Morning Brief.

## 4. Creation flow

1. Kai recognizes recurring intent (explicit: "every Friday…", or inferred from three similar Directives).
2. It produces an **Automation Proposal**: schedule, agents, fence, output, and an example of what the
   output would look like.
3. **Dry run first.** The first execution runs immediately, in dry-run mode, so the Principal sees the real
   shape before granting a standing schedule. Nothing is scheduled until he has seen one output.
4. On approval, the trigger is created and a Decision is recorded.

Standing automation is the largest grant of autonomy in the product. The dry-run requirement makes that
grant informed rather than hopeful.

## 5. Value tracking and self-retirement

Every run is rated: explicitly by the Principal (in the digest, one keystroke) or implicitly (unread twice
= low value; acted upon = high value).

```
if consecutive_low_value >= 3:
    pause the trigger
    surface in the Morning Brief:
      "The Friday engineering review hasn't been useful for three weeks.
       Change it, or should I retire it?"
```

The Firm proposing to retire its own work is a feature, not a failure. Unused automation is worse than no
automation: it costs money, adds noise, and trains the Principal to ignore the system.

## 6. Standing automations shipped in 1.0

| Name | Schedule | Fence | Output |
|---|---|---|---|
| Standup → Morning Brief | 06:45 daily | read-only, $0.30 | Lobby card |
| Night Shift consolidation | 02:00 daily | read+mem.write, $0.50 | Digest in the Morning Brief |
| Snapshot and restore drill | 02:30 daily / weekly | fs within Vault | Silent unless it fails |
| Decision review sweep | 08:00 Mondays | read-only, $0.10 | Brief item if anything is due |
| Budget check | hourly | read-only, free | Notification at 80% and 100% |
| Corpus health | Sundays 03:00 | read-only, $0.20 | Digest |

All six are disabled-by-default except the Standup, Night Shift, and snapshot; the Principal enables the
rest as he decides he trusts them.

## 7. Safety properties

| Property | Mechanism |
|---|---|
| No automation can spend without a ceiling | Ceiling is a required field |
| No automation can act irreversibly | `effect_max ≤ 2` is enforced; class 3 is unavailable to triggers in 1.0 |
| No automation can message a third party | Requires class 3 |
| Runaway loops are impossible | A trigger cannot create a trigger; depth is 1 |
| The Principal always knows | Every run is in the Console; every automation is listed with its fence |
| Instant stop | Global "Pause all automation" in the Console and ⌘K, and a per-trigger kill switch |

## 8. Console surface

The Console shows: each trigger with next run, last run, last outcome, 30-day cost, value rating trend, and
its fence in plain sentences. One click pauses. One click shows the full run history with traces. Automation
you cannot see is automation you cannot trust.
