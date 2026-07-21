# Migration Strategy — Version 1.0 → Version 2.0

How a running v1 Firm becomes a v2 Firm without an outage, a data migration, or a rewrite.

**The claim this document defends:** there is no migration event. v2 is a sequence of additive changes, each
independently shippable, each leaving the Firm working. At no point does the Principal experience a
transition.

## 1. Why this is possible

Three v1 decisions, made before there was any v2 to design for:

1. **The event log is the source of truth (ADR-0002).** Tables are projections. Adding a department adds
   event kinds and rebuilds projections; it does not migrate state, because there is no state to migrate.
2. **Typed Work Orders (ADR-0010).** The routing envelope already exists, already carries budget and fences,
   already survives restart. v2 adds two optional fields.
3. **The kernel is a library, not app logic (`/docs/02-architecture/09-scalability.md`).** Departments load
   into a kernel that does not know what a department is until it reads a manifest.

If any one of these had gone the other way, v2 would be a rewrite. That is worth stating because it is the
strongest available argument for the v1 documents that looked over-engineered at the time.

## 2. The compatibility contract

Binding rules for every v2 change:

| Rule | Consequence |
|---|---|
| **No event kind is removed or redefined.** | A v1 event log replays on a v2 kernel |
| **No column is dropped or changed in meaning.** | Additive columns only, all nullable |
| **No command is removed.** | v1 commands work identically; v2 adds new families |
| **No message kind is removed.** | Twelve become fourteen |
| **Every new field is optional with a v1-equivalent default.** | A Work Order with no `department_id` behaves exactly as it did in v1 |
| **No Principal-facing behaviour changes without a setting.** | The v1 experience remains reachable |
| **Migrations are forward-only and idempotent.** | v1's store rule, unchanged |

A change that cannot be made under these rules is not made in v2. It waits for 3.0, where a major version
permits a real break — and even there, the event log means "break" means "change the projection", not "lose
history".

## 3. The v1 Firm as a v2 Firm

The eleven v1 agents are not migrated. They are *reinterpreted* by a manifest.

At the moment of upgrade, the Firm is expressed as a minimal v2 configuration:

```
Divisions:    Engineering (Rune) · Product (Iris) · Commercial (Sable) · Corporate (Quill)
Departments:  Software Engineering (Vega) · AI Engineering (Orin) · UI/UX (Mira)
              Infrastructure (Atlas's charter) · Marketing (Sable's charter) · Finance (archetype)
Offices:      Quality (Argus) · Cost (Cass)
```

Four Divisions, not eight — the other four appear when their departments are installed. Two Offices, not
four — Architecture and Security appear with Rune's second hat and with Corvus.

**Every v1 agent keeps its ID, its memory, its history, and its KPI record.** Argus moving from the
Technology department to the Quality Office is a change to one field on one record; the audit chain is
intact, the memory is intact, and an Engagement from before the change still resolves `agent.qa` to Argus.

The generated manifest is shown to the Principal before it is applied, as a Decision. It is not a background
migration, because Principle 14 says the Firm's structure is subject to the Firm's rules and a structural
change made silently would violate it.

## 4. Sequence

Each step ships independently and leaves a working Firm.

| Step | Change | Visible to the Principal? | Reversible? |
|---|---|---|---|
| **1** | Schema additions: nullable columns, three new tables, four new event kinds. Nothing reads them. | No | Yes — unused columns |
| **2** | Department Registrar ships, loading exactly one implicit department containing all eleven agents. Behaviour identical. | No | Yes — feature flag |
| **3** | Standards Engine and Guard Runner ship with an empty standards set. No standards means no change. | No | Yes |
| **4** | Exchange ships. Unused while there is one department. | No | Yes |
| **5** | The v1 Firm is re-expressed as the manifest in §3. Shown as a Decision. Rooms gain a Division level. | **Yes** — the Rail changes | Yes — the previous manifest is a record |
| **6** | Offices formalised. Argus and Cass move out of the delivery line; their vetoes widen from department to firm scope. | Yes — veto scope changes | Yes |
| **7** | First new department installed (Backend or Cybersecurity). The Exchange carries real traffic for the first time. | Yes — a new room | Yes — uninstall |
| **8** | Game Studio Pack, per `03-game-studio/03-integration-plan.md`. | Yes | Yes — uninstall |
| **9** | Marketplace with a local publisher and an empty catalogue. | Yes — a new settings section | Yes |
| **10** | Remaining departments, as the work requires them. Never all at once. | Yes | Yes |

Steps 1–4 are invisible: the Firm is running v2 machinery with a v1 shape and the Principal cannot tell. Step
5 is the only one that changes the interface, and it is a Decision the Principal makes rather than an update
that arrives.

## 5. Rollback

| Step | Rollback |
|---|---|
| 1–4 | Feature flag off. Columns and services are unused. |
| 5 | Re-apply the previous manifest. It is a record in the event log; applying it is a normal operation. |
| 6 | Same. Office assignment is manifest data. |
| 7–10 | Uninstall the Pack. Memory namespace persists read-only; artifacts persist; history persists. |

**Nothing in v2 is destructive**, which follows from Principle 3 rather than from caution. There is no step
whose rollback requires restoring a backup, and if one is discovered during implementation it is a design
defect to be fixed, not a risk to be accepted.

## 6. The acceptance test

One test decides whether this architecture did what it claims:

> Take a complete v1 Engagement from the event log — a Directive, its Mandate, its Work Orders, its
> Deliverables, its Brief. Replay it against a v2 kernel with the §3 manifest, with model calls stubbed by
> recorded responses.
>
> **The Brief must be byte-identical.**

If it is, v2 is an extension. If it is not, v2 changed something it claimed not to change, and the difference
identifies exactly what.

This runs in CI on a corpus of recorded Engagements, and it is the gate on every step in §4. It is the same
technique v1 specified for charter regressions, applied to the architecture itself.

**What the test cannot cover:** anything involving a real model call, since v2 changes routing depth and
therefore the frames agents see. That is the point of the stubbing — the test asks whether the *machinery*
is equivalent, not whether the models produce identical text, which they would not do twice in a row anyway.
Model-level behaviour is covered by the evaluation sets, which is the right instrument for it.

## 7. What the Principal experiences

The honest version, since a migration document that promises invisibility is usually lying somewhere:

- **Nothing, through step 4.**
- **At step 5:** the Rail shows Divisions instead of rooms. ⌘1–⌘9 rebind. This is a real change and it is
  announced in the Brief with a one-line explanation and a link to the new shape. It is also the change most
  likely to be mildly annoying for a week.
- **At step 6:** Argus and Cass start vetoing things outside their old departments. This will feel like the
  Firm got stricter, because it did. The Brief explains the widened scope on first occurrence.
- **At step 7 onward:** new rooms appear only when the Principal installs a department. Nothing arrives
  uninvited. This is the load-bearing promise of the whole migration and it is the one that must not be
  broken for convenience during implementation.

Total Principal-facing disruption: one interface change, one behaviour change, both announced, both
reversible.
