# ADR-0046 — The concrete five-connector set and their effect-class maps

**Status:** Proposed · **Date:** 2.5 "Field" — M17

## Context

M16 shipped the connector framework and, deliberately, no connector. `/MILESTONE_REGISTRY.md` §4 defines M17
as *"Source control, issue tracker, calendar, mail, object storage — the five the Firm needs to do its own
work,"* with the exit criterion *"five connectors pass the same conformance suite; each is grantable per
department; each degrades to offline without data loss."*

The registry names five *categories* but not five *services*, not their *operations*, and not — most
consequentially — the *effect class* of each operation. Effect class is what makes "irreversible" mechanical
rather than a judgement (security model §5): a merge, a delete, or a mail send must be class 3 (always asks) or
the Firm can fire an irreversible external effect autonomously. Leaving the per-operation class map unstated
would leave the single most safety-critical fact about each connector to an implementer's guess.

Two further things are open. **Which department does each connector serve?** A connector is granted to a
department (ADR-0035), so each of the five needs an anchor in the department catalog or the grant target is
arbitrary. **Which auth kind does each use?** The framework supports `none | api_key | oauth2` (M16 §5.1); the
suite should exercise the real paths, not all pick one.

## Options

1. **Leave the five as categories; let AntiGravity choose services, operations, classes, and departments per
   connector at implementation time.** Minimal architecture. But the effect-class map is a security boundary,
   not an implementation detail — deferring it means five separate ad-hoc decisions about what "always asks,"
   made by whoever writes each manifest, unreviewed as a set. Rejected.
2. **Pin all five to a single vendor's ecosystem (e.g. all Google, or all GitHub).** Simplifies auth (one
   OAuth app). But couples the Firm's basic operation to one vendor, makes the issue tracker and source control
   share a host (weakening the "separate connector, separate grant" property), and exercises only one custody
   path. Rejected.
3. **Pin the five concrete services, their operations, their per-operation effect classes, their auth kind,
   and their primary/grantable departments, here, as one reviewed decision — choosing across vendors to
   exercise both custody paths and to keep the five genuinely independent.** The map becomes a manifest fact
   the M16 install checks enforce (check #4), reviewed once as a coherent set.
4. **Ship more than five (a broader suite).** Contradicts the registry ("the five") and Principle 1 (the Firm
   does not arrive with capability the Principal did not ask for). Rejected.

## Decision

Option 3. The five first-party connectors are:

| id | service | auth | primary department | grantable also to |
|---|---|---|---|---|
| `git` | GitHub | `oauth2` (PKCE) | Software Engineering | Backend, Frontend, Mobile |
| `issues` | Linear | `api_key` | Software Engineering | Product Design |
| `calendar` | Google Calendar | `oauth2` (PKCE) | Sales | Customer Success |
| `mail` | Gmail | `oauth2` (PKCE) | Customer Success | Sales, Marketing |
| `object-storage` | S3-compatible | `api_key` | Data Engineering | Infrastructure, Cloud |

Auth is deliberately mixed — three `oauth2`, two `api_key`, zero `none` — to exercise both M16 custody paths.
`none` is used by no first-party connector: every service the Firm needs for its own work authenticates the
Firm, so an unauthenticated external read is not among the five.

**Effect-class maps (the security-critical part), following security model §5 and M16 §10 — 1 read · 2
reversible write · 3 irreversible/external, always asks:**

- **`git`:** `list_repositories`/`get_file`/`list_commits`/`list_pull_requests` = 1; `open_pull_request`/
  `comment_on_pull_request` = 2; `merge_pull_request`/`delete_branch` = 3.
- **`issues`:** `list_issues`/`get_issue` = 1; `create_issue`/`update_issue`/`add_comment` = 2;
  `delete_issue` = 3. All operations are `POST /graphql`; **class is declared per operation, not inferred from
  the verb** (M16 install check #4).
- **`calendar`:** `list_events`/`get_event` = 1; `create_event`/`update_event`/`cancel_event` = 2;
  `send_invitation` = 3 (dispatches mail to third parties).
- **`mail`:** `list_messages`/`get_message`/`search_messages` = 1; `create_draft` = 2; `send_message` = 3
  (irreversible external send — the canonical class-3 case).
- **`object-storage`:** `list_objects`/`get_object`/`head_object` = 1; `put_object` = 2 (versioned bucket →
  reversible); `delete_object` = 3.

Each department anchor is justified against `04-department-catalog.md`: `git`/`issues` serve Software
Engineering (implementation, technical debt); `calendar`/`mail` serve the Commercial division (Sales
call-prep, Customer Success draft-response); `object-storage` serves Data Engineering (the `datasets`
registry). Each is a *primary* grant with the connector grantable to the listed additional departments, each
as its own `ConnectorGrant` with its own credential (ADR-0035).

## Consequences

**Accepted: the five services are now a named compatibility surface.** If GitHub, Linear, Google, or S3
changes its API, the affected manifest (and optional transform) must be updated. Real cost, paid per external
change, isolated to one artifact each.

**Accepted: the effect-class map is a reviewed boundary, not an implementer's choice.** Changing whether an
operation "always asks" now requires editing this decision, not just a manifest line — which is correct for a
security boundary.

**Gained: the exit criterion is concrete.** "Five connectors pass the same conformance suite" has five named
subjects with fixed operations and classes, so the acceptance harness (E7) has something definite to run.

**Gained: both custody paths and all three effect classes are exercised by real artifacts**, not just by the
M16 test fixtures — three OAuth connectors, two api-key connectors, class 1/2/3 present across the set.

**Gained: the five are genuinely independent.** Choosing Linear (not GitHub Issues) for the tracker means
source control and issue tracking are separate connectors with separate hosts and separate grants — filing an
issue neither requires nor grants source-control reach.

**Reversal cost: low, per connector.** A first-party connector is data; swapping Linear for another tracker,
or Gmail for another mail service, is a new manifest and a new conformance run, touching no kernel code and no
other connector. Reversing the *set* (dropping to four, or the "artifacts only" stance) is the higher-cost
change, which is why the set is pinned here rather than left open.
