# ADR-0042 — A firm-wide veto is enforced as a non-downgradable blocking Guard at the choke point

**Status:** Accepted · **Date:** M12 architecture phase · **Supersedes:** — (operationalises ADR-0015)

## Context

ADR-0015 decided *where* vetoes live: four Offices, outside every delivery line, each holding a narrow scoped
veto not overridable by a Division executive. It did not decide *how* a veto is enforced. M11 shipped the Guard
Runner (an extension of the Permission Broker) with an empty Standards set, and M12 is the first milestone that
makes a veto real — it must wire firm-wide vetoes through a concrete enforcement point.

The mechanism matters because two adjacent mechanisms already exist and either would be the wrong choice:

- A **review block** (ADR-0008) is a per-Deliverable reviewer verdict (`reviews.verdict='block'`). It is
  scoped to one Deliverable and resolved by rework. A firm-wide veto over, say, a class-3 effect or an egress
  change is not a Deliverable review and cannot be modelled as one.
- A **Standard violation** (ADR-0016) is detected by a Guard that *warns or blocks*. A Guard that warns is
  exactly the ceremonial-review failure mode (`/MASTER_IMPLEMENTATION_GUIDE.md` §10 failure mode 3): if a veto
  can be downgraded to a warning by a setting or a Review Intensity level, the veto is decoration.

The Permission Broker is the only choke point (`/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 5), and the Guard
Runner is its neighbourhood (`/docs-v2/01-enterprise-architecture.md` §3). The open question M12 must answer:
at what point, and with what override semantics, is a firm-wide veto enforced?

## Options

1. **Model a veto as a review block.** Reuse `reviews`. Fits Quality naturally, but Security/Cost/Architecture
   vetoes over effects, spend, and contracts are not Deliverable reviews; forcing them into `reviews` distorts
   the schema and loses the firm-wide reach.
2. **Model a veto as a warning-capable Guard.** Reuse the Guard Runner but let Review Intensity tune it. Cheap,
   and it reintroduces failure mode 3: an Office that can be turned down to "warn" approves everything by
   configuration.
3. **A veto is a non-downgradable blocking Guard at the choke point, with the override path restricted to the
   Principal (Security only).** The Guard Runner runs it at the relevant lifecycle point (pre-effect,
   pre-deliverable, pre-commit); its verdict cannot be downgraded to a warning by any setting; a Division
   executive cannot override it; only the Principal can, and only for the Security Office, recorded as a
   Decision.
4. **A new dedicated veto subsystem separate from the Guard Runner.** Maximum clarity, but it duplicates the
   choke point — and a second enforcement point is exactly the hole "the Broker is the only choke point" exists
   to prevent.

## Decision

Option 3. A firm-wide veto is enforced as a **non-downgradable blocking Guard** executed by the Guard Runner at
the choke point:

- The Guard runs at the lifecycle point matching the Office's scope: Security at pre-effect (class-3 effects,
  egress changes, capability widenings), Quality at pre-deliverable, Architecture at pre-deliverable/pre-commit
  (contract/interface changes), Cost at pre-effect (spend over ceiling).
- On a scope match the Guard **blocks**; its verdict cannot be downgraded to a warning by any setting or Review
  Intensity level. This is the property that makes the veto a Fence-side "you may not", not a Guard-side "you
  did it badly" (`/docs-v2/02-agent-architecture-v2.md` §6).
- A **Division executive cannot override** a veto. The only override actor is the Principal, and only for the
  Security Office, recorded as a Decision with the accepted risk named (ADR-0015;
  `/docs-v2/03-executive-cabinet.md`, Corvus).
- Every invocation is a `Veto` record on the hash chain (`VetoInvoked` + `VetoUpheld`/`VetoOverridden`), and
  the `veto_records` projection powers the veto-rate instrument (an above-95% approval rate is a defect).

## Consequences

**Accepted: a veto adds a policy check to the hot path of effects in its scope.** Real, but bounded — the veto
runs at an existing choke point the effect already passes through (class-3 effects and egress changes already
traverse the Broker), so it is a policy check, not a model call. Priced and gated by the failure-mode-4
latency/token budget (`STRUCTURE_ARCHITECTURE.md` §9; R-01).

**Accepted: the non-downgradable property is a constraint implementers can be tempted to relax under schedule
pressure.** "Just let Review Intensity tune the veto down" is precisely failure mode 3. It is refused
structurally: the veto Guard has no warn setting, and the veto-rate instrument makes a ceremonial Office
visible.

**Accepted: the override path is asymmetric.** Only Security is Principal-overridable; Quality, Cost, and
Architecture vetoes have no override at all short of fixing the work or filing a dissent. This asymmetry is
inherited from ADR-0015 and is deliberate.

**Gained: one choke point, not two.** The veto reuses the Permission Broker's neighbourhood via the Guard
Runner; no second enforcement point is introduced, so "the Broker is the only choke point" stays true
(`/MASTER_IMPLEMENTATION_GUIDE.md` §3 item 5).

**Gained: ceremonial review is detectable.** Because every veto is a record on the hash chain, `office_veto_rate`
is computable and the 95%-approval-is-a-defect floor is enforceable (ADR-0015).

**Gained: the veto is distinguishable from a review block in the data.** A `Veto` record and a `reviews` block
are different rows with different semantics, so an auditor can tell a firm-wide veto from a Deliverable review
without inference.

**Reversal cost: low.** The veto Guard is wiring over the existing Guard Runner. Folding vetoes back into
`reviews` (Option 1) is a projection change, and the history remains coherent because every veto is already an
event on the log. Nothing in the event log becomes invalid.
