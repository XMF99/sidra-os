# ADR-0035 — A connector is granted to a department, never to the Firm

**Status:** Accepted · **Date:** M16 / Connector Framework · **Relates to:** ADR-0013, ADR-0015, ADR-0017, security model §4, layer model §6
**File at:** `docs-v2/adr/0035-connectors-granted-to-a-department-not-the-firm.md`

## Context

The layer model (`02-layer-model.md` §6) already states the rule in prose: *"An Integration is granted to
specific Departments, never to the Firm — Marketing does not hold the production cloud credential because
Marketing is not the department that has any use for it."* And department manifests already carry
`integration:*` entries in `[capabilities].required/optional/forbidden`. What does not yet exist is the
mechanism that makes the prose true — the record that binds a connector to a department, and the check that
refuses a call from any other.

The temptation, under schedule pressure, is a firm-wide connector: install GitHub once, and any agent can use
it. This is the single most damaging shortcut available at M16, because a firm-wide grant is a permission that
already works, and `MILESTONE_REGISTRY.md` §5 states the governing principle: *"a permission that already
works is the change nobody makes later."* Retrofitting per-department isolation onto a firm-wide connector
means finding and re-scoping every caller — the migration nobody completes.

## Options

1. **Firm-wide connectors.** Install grants reach. Simplest, and it destroys the isolation the entire
   enterprise model rests on: any compromised or over-eager agent in any department reaches every connected
   service. Marketing reaches production. There is no boundary left to enforce.
2. **Per-department grants, enforced by convention.** A grant names a department; callers are *expected* to be
   in it. Isolation is then a code-review property, and "isolation enforced by a participant is not isolation"
   (`01-enterprise-architecture.md` §3, the argument for why the Exchange is kernel).
3. **Per-department grants as a kernel-enforced primitive.** `ConnectorGrant` carries a required
   `DepartmentId`; the connector host resolves the calling agent's department via the Registrar and refuses
   any call lacking a matching grant, structurally, before the Permission Broker's effect logic.
4. **Per-agent grants.** Finer still, and wrong: capability flows department → agent already (M13 §4, three
   nested subsets). A per-agent connector grant duplicates the agent capability ceiling and fragments the
   audit — the department is the correct scope because the department is where a domain's tools live.

## Decision

Option 3. **A connector is granted to exactly one department per grant. The grant type carries a required
`DepartmentId` and has no firm-wide variant. The connector host resolves the calling agent's department and
refuses any invocation without a matching un-revoked grant — before the Broker, before any request is built,
before anything leaves the machine.**

- The `integration:<connector-id>:<action>` namespace is the capability grammar (`action ∈ {read, write,
  admin}`), formalizing the entries already present in department manifests.
- A scope in a department's `[capabilities].forbidden` set can never be granted, through any future approval
  (ADR-0013 self-denial, honored at grant time).
- Two departments needing the same connector produce two grants and two credentials — never a shared one, by
  the same reasoning that gives two departments two agent instances rather than one shared instance
  (`02-layer-model.md` §4).

## Consequences

**Accepted:** a department that legitimately needs a connector another department already has must be granted
its own — a second OAuth flow, a second credential. This is duplication, and it is the correct cost: the
alternative is a shared credential, which is a shared blast radius.

**Accepted:** the connector host must resolve agent → department on every call. One Registrar lookup, cached
per Engagement. Cheap.

**Gained:** the isolation is mechanical and testable. The exit criterion — "granted to exactly one department,
no other department can reach it, proven by test" — is a direct assertion over this primitive (AC2). The
refusal is structural: an agent in the wrong department fails before the effect system even runs.

**Gained:** the firm-wide-grant shortcut is not merely discouraged, it is unrepresentable. There is no "firm"
value to pass where a `DepartmentId` is required. The most damaging mistake at this layer cannot be typed.

**Gained:** budget and audit attribute correctly. A connector call is charged and logged against the
department that holds the grant, consistent with "cost follows the requester" in the Exchange (M13 §5).

**Reversal cost:** high once grants and their credentials exist across departments. Unwinding to firm-wide
would mean collapsing N per-department credentials into one and rewriting every caller's assumption — which is
exactly the migration this ADR front-runs by deciding now.
