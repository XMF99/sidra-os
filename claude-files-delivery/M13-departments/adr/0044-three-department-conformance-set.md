# ADR-0044 — The exit-criterion conformance set is Backend, Cybersecurity, and Software Engineering

**Status:** Proposed · **Date:** M13 architecture phase · **Supersedes:** — (fixes a default the sources leave open)

## Context

M13's exit criterion is **three departments installed from Packs, and one Exchange request end to end**
(`/MILESTONE_REGISTRY.md` §4). The catalog specifies twenty-one departments and marks seven **CORE** for the
first run (`04-department-catalog.md`), but it does not say *which three* the exit-criterion conformance test
installs, nor which contract the one Exchange request names. A test fixture that ships with a milestone is a
default that ships, and defaults that ship need a record (`/MASTER_IMPLEMENTATION_GUIDE.md` §8). Choosing badly
here produces a test that passes without exercising the invariants the milestone exists to prove — an install
that never resolves a `requires` contract, or an Exchange request invented for the test rather than drawn from
the design.

## Options

1. **Three arbitrary departments with a synthetic contract between them.** Passes, and proves little — the
   request is a contrivance, not a documented flow, and a reviewer cannot check it against the source.
2. **Three departments with no `requires` relationship, plus a hand-wired Exchange call.** The install half is
   real but the Exchange half tests a path the architecture did not specify.
3. **Backend, Cybersecurity, and Software Engineering — a trio the catalog already wires together — running the
   Exchange request the source already documents.**
4. **All seven CORE departments.** More coverage, but "three" is the exit criterion; installing seven tests
   Division budget-summing (check #11) harder while making the minimal exit criterion non-minimal and slower to
   green. Deferred to M14's broader acceptance list, not the M13 exit criterion.

## Decision

Option 3. The exit-criterion conformance set is:

| Department | Catalog | Role in the test |
|---|---|---|
| **Backend** (`dept.backend`) | #2, CORE | the **requester**; its manifest declares `requires.contracts = ["capability.code-review", "capability.security-review"]` (`03-department-architecture.md` §2) |
| **Cybersecurity** (`dept.cybersecurity`) | #11, CORE | provides `capability.security-review` — the contract the one Exchange request names |
| **Software Engineering** (`dept.software-engineering`) | #1, CORE | provides `capability.code-review` — the second contract Backend requires, so the Registrar resolves **two** contracts to **two** departments |

The one Exchange request is **Backend → `capability.security-review` → (Registrar resolves to) Cybersecurity**,
the worked example in `03-department-architecture.md` §5 ("Review the token refresh flow for replay
exposure."). Software Engineering's `capability.code-review` is installed and resolvable but is not the
demonstrated request — the exit criterion is *one* Exchange request.

## Consequences

**Accepted: the conformance set is opinionated.** A future reader might expect the test to be parameterised
over any three Packs. It is not — it is these three, because a named, sourced trio is checkable against the
design and a generic one is not. Parameterised conformance over arbitrary Packs is a separate, later goal (the
reusable suite M14 and M17 build on).

**Accepted: two of the three departments (Cybersecurity, Software Engineering) exist in the fixture mainly to
be resolution targets.** Their full delivery behaviour is exercised elsewhere; here they prove the Registrar
resolves distinct contracts to distinct departments.

**Gained: the exit criterion tests a documented flow, not an invented one.** Every element — the requester, the
two `requires` contracts, the single Exchange request, its objective — is drawn verbatim from
`03-department-architecture.md` §2 and §5 and `04-department-catalog.md`. A reviewer verifies the test against
the source, which is the point of a conformance test.

**Gained: "three" is meaningful.** Software Engineering provides the *other* contract Backend requires, so
installing three (not two) proves multi-contract resolution rather than a single lucky path.

**Gained: the trio is the Firm's real default.** All three are CORE (`04-department-catalog.md` §Summary), so
the fixture is the recommended first-run Firm, not a test-only construction.

**Reversal cost: low.** The conformance set is fixture data plus one test file. Swapping the trio, or promoting
the test to a parameterised suite, is a change to `services/departments/conformance/` with no schema or kernel
impact.
