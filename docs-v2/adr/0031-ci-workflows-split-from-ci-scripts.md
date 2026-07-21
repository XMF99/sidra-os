# ADR-0031 — CI workflow files live in `.github/workflows/`; the checks they run live in `infrastructure/ci/`

**Status:** Accepted · **Date:** M15 / E1 / T1.1 · **Relates to:** ADR-0011

## Context

ADR-0011 places continuous integration under `infrastructure/ci/`, on the reasoning that build, release and
proof belong in one directory that depends on everything and on which nothing depends.

GitHub Actions does not read that directory. Workflow files are discovered only at `.github/workflows/`. The
two requirements cannot both be satisfied by a single location.

This surfaced during T1.1, which had to place a real workflow file somewhere. Recorded here because
`/MASTER_IMPLEMENTATION_GUIDE.md` §8 requires an ADR for any divergence from a documented boundary, and
because leaving it undocumented would make ADR-0011 quietly false for the first person who reads it and then
looks at the tree.

## Options

1. **Put everything in `.github/workflows/`.** Works with the platform; contradicts ADR-0011; makes CI logic
   unrunnable locally without copying commands out of YAML by hand.
2. **Put everything in `infrastructure/ci/` and accept that CI does not run.** Faithful to the ADR and
   useless.
3. **Split by role: thin triggers in `.github/workflows/`, every check as a script in `infrastructure/ci/`.**
4. **Use a CI system that reads arbitrary paths.** Solves the naming problem by adopting a different platform
   for the sake of a directory, which is not a reason to choose a CI platform.

## Decision

Option 3. Workflow files in `.github/workflows/` contain triggers, runners, and toolchain setup, and nothing
else. Every check is a script under `infrastructure/ci/`, invoked by one line from the workflow.

The test: **any check must be runnable locally by the exact command CI runs.** A workflow step containing
logic rather than an invocation is a defect.

## Consequences

**Accepted:** two directories are involved in CI, and a newcomer must learn that the workflow file is not
where the work is. Mitigated by `infrastructure/ci/README.md`, which lists every check with its local command.

**Accepted:** ADR-0011's statement that CI lives under `infrastructure/` is now precise rather than complete.
This ADR is the amendment; ADR-0011 is not edited, per the rule that decision records are superseded and not
rewritten.

**Accepted:** a thin trigger can still drift from the script it calls — a path filter can go stale while the
script stays correct.

**Gained:** checks are locally reproducible. An engineer debugging a red build runs the same script the runner
ran, rather than reconstructing it from YAML.

**Gained:** checks are testable. `infrastructure/ci/check_dependency_direction.py` has its own test suite,
which would be impossible for logic embedded in a workflow step.

**Gained:** platform portability. Moving CI systems means rewriting triggers, not rewriting checks.

**Reversal cost:** low. Inlining the scripts back into workflow steps is mechanical, and would only be done by
someone who had decided local reproducibility was not worth having.
