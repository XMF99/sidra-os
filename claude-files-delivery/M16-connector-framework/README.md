# M16 — Connector Framework · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M16 (Connector Framework), release 2.5
"Field". Architecture and specification only — **no production code**, per the workflow.

## What this milestone delivers

The Layer-6 substrate: the kernel machinery (`sidra-connectors`) that installs, grants, authorizes, and
mediates connectors to external services. It does **not** ship any connector — the first-party connector suite
is M17. It ships the framework and the conformance suite those connectors will run against.

**Exit criterion:** a connector is installed, granted to exactly one department, and no other department can
reach it — proven by test, not by configuration.

## Contents

| File | What it is |
|---|---|
| `00-M15-AUDIT.md` | STEP 1 gate: confirms M15 is architecturally complete; notes non-blocking metadata staleness |
| `CONNECTOR_FRAMEWORK_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0034-connector-credentials-held-by-the-kernel.md` | Custody: the kernel holds credentials, the connector never does |
| `adr/0035-connectors-granted-to-a-department-not-the-firm.md` | The per-department grant as the isolation primitive |
| `adr/0036-egress-declared-in-manifest-enforced-by-kernel.md` | Declare-then-enforce egress |
| `adr/0037-oauth-is-a-kernel-capability.md` | OAuth runs in the kernel; the connector touches no secret |
| `IMPLEMENTATION_PLAN.md` | E1–E10, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The four decisions, in one line each

1. **Custody (0034):** the kernel holds the credential in the keychain and injects it at the egress boundary;
   the connector never possesses it.
2. **Per-department grant (0035):** `integration:<id>:<action>` is granted to exactly one department; there is
   no firm-wide grant, structurally.
3. **Egress (0036):** a connector reaches only the hosts it declared in its signed manifest; the kernel builds
   the URL.
4. **Kernel OAuth (0037):** the connector declares OAuth config; the kernel runs PKCE + refresh and holds the
   token.

## Reading order

1. `00-M15-AUDIT.md` — why it was safe to start M16
2. `CONNECTOR_FRAMEWORK_ARCHITECTURE.md` — §1–§4 for the stance and model, then the ADRs
3. The four ADRs — the load-bearing decisions
4. `IMPLEMENTATION_PLAN.md` — what to build, in order
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Copy the four ADRs to `docs-v2/adr/`, add rows to `docs-v2/adr/README.md`, mark `Accepted` on approval.
- Migrations begin at `0025_` (mission migrations end at `0024_`).
- On completion, update `MILESTONE_REGISTRY.md` M16 status `Defined → Documented`; the number is permanent
  from that point (registry rule 4).
- Dependency direction is CI-enforced: `sidra-connectors` must not import `sidra-orchestrator` or
  `sidra-mission`.

**Then STOP.** Do not begin M17 until M16 is implemented, integrated, and its exit-criterion test is green.
