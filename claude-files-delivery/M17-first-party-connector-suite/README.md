# M17 — First-Party Connector Suite · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M17 (First-Party Connector Suite),
release 2.5 "Field". Architecture and specification only — **no production code**, per the workflow.

## What this milestone delivers

The first content on the M16 connector framework: **five signed Layer-6 connector artifacts** — source
control (`git`/GitHub), issue tracker (`issues`/Linear), calendar (`calendar`/Google Calendar), mail
(`mail`/Gmail), and object storage (`object-storage`/S3-compatible) — plus the conformance evidence that all
five pass the M16 suite. Each is a `connector.toml` manifest (plus an optional Wasm response transform) under
`agents/connectors/`, running on the unchanged `sidra-connectors` framework.

**M17 ships no framework mechanism.** No new `services/*` crate, no new install check, no new grant type, no
bypass of the Permission Broker, no firm-wide grant. It is five artifacts and the proof the framework already
carries them.

**Exit criterion:** five connectors pass the same conformance suite; each is grantable per department; each
degrades to offline without data loss.

## Contents

| File | What it is |
|---|---|
| `00-M16-AUDIT.md` | STEP 1 gate: confirms M16 is architecturally complete and every framework surface M17 needs is specified |
| `CONNECTOR_SUITE_ARCHITECTURE.md` | The architecture — the authority on the five connectors' behaviour |
| `adr/0046-the-concrete-five-connector-set.md` | The concrete five services, their operations, and their per-operation effect-class maps |
| `adr/0047-per-connector-offline-degradation-contract.md` | Offline degrades cleanly; no connector buffers a write; the Vault-held Work Order is the single record of intent |
| `adr/0048-object-storage-addressing-and-chunking.md` | Path-style single-host addressing, bounded-chunk streaming, multipart with abort-on-failure, a max object size |
| `IMPLEMENTATION_PLAN.md` | E1–E7, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The three decisions, in one line each

1. **The five set (0046):** `git`·`issues`·`calendar`·`mail`·`object-storage`, mixed auth (3 oauth2, 2
   api-key), each anchored to a department, with the effect-class of every operation pinned (merge/delete/send
   = class 3, always asks).
2. **Offline no-buffer (0047):** each connector degrades to offline by failing cleanly and marking
   `Unreachable`; no write is ever buffered — the undispatched effect stays a Work Order intent in the Vault
   and re-dispatches exactly once on recovery, so nothing is lost and nothing fires twice.
3. **Object-storage contract (0048):** path-style addressing keeps egress to one declared host; large objects
   stream in bounded chunks with multipart-abort-on-failure; a declared max object size; the kernel signs
   (SigV4), so the connector never sees the AWS secret.

## Reading order

1. `00-M16-AUDIT.md` — why it was safe to start M17
2. `CONNECTOR_SUITE_ARCHITECTURE.md` — §1 (stance: artifacts, not mechanism), §4 (the five specifications),
   then the ADRs
3. The three ADRs — the load-bearing decisions
4. `IMPLEMENTATION_PLAN.md` — what to build, in order (E1 harness → E2–E6 the five → E7 the exit criterion)
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- **These are Layer-6 artifacts, not kernel code.** The five connectors live under `agents/connectors/`; M17
  touches no file in `services/connectors`. The M16 kernel-neutrality grep (no connector id in the framework
  crate) must still pass — it does, because M17 changed no kernel code.
- Copy the three ADRs to `docs-v2/adr/`, add rows to `docs-v2/adr/README.md`, mark `Accepted` on approval.
  Numbering is contiguous: **0046–0048** (after M16's 0037 and the parallel M10–M14 batch's 0038–0045).
- **Migrations:** exactly one, additive — `0030_connector_conformance.sql` (the exit-criterion evidence
  projection). The M16 framework tables (`0025`–`0029`) are not touched; `0031_` is reserved by the pinned band
  but unused.
- On completion, update `MILESTONE_REGISTRY.md` M17 status `Defined → Documented`; the number is permanent
  from that point (registry rule 4).
- Dependency direction is inherited from M16 and unchanged: M17 adds no crate and no edge; the CI check that
  `sidra-connectors` has no edge to `sidra-orchestrator`/`sidra-mission` remains green untouched.

**STOP — do not begin M18 until M17 is implemented, integrated, and all five connectors pass the conformance
suite.** M17 implementation itself must not begin until M16 is implemented and its exit-criterion test is green
(see `00-M16-AUDIT.md` §3).
