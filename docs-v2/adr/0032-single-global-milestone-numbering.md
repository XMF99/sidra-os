# ADR-0032 — Milestone numbering is single, global, and permanent once documented

**Status:** Accepted · **Date:** post-M15 · **Supersedes:** the "M10" label in
`/docs-v2/03-Intelligence/MISSION_ENGINE_IMPLEMENTATION_PLAN.md` and its §0.2 "Reading A"

## Context

Three documents assigned meanings to the same milestone numbers and did not agree.
`/MASTER_IMPLEMENTATION_GUIDE.md` §5 defined M1–M14, with M10 as *Hardening and 1.0*. The Mission Engine
implementation plan labelled the Mission Engine *M10*. `/MISSION_ENGINE_ARCHITECTURE.md` Appendix C placed the
Mission Engine after M14, on the grounds that it depends on the department substrate delivered at M11–M13.

The implementation plan identified this in §0.2, offered two readings, listed it as risk IR-10, and required
resolution before task T1.1. **T1.1 proceeded without it.** The consequence arrived at the next instruction:
"continue from M11" is ambiguous between *Department substrate* and *the milestone after the Mission Engine*,
and no reading of the existing documents settles it.

A milestone number is not a label. It appears in commit trailers, ADR dates, task identifiers, acceptance
criteria and schedules. Ambiguity in it is ambiguity in all of those.

## Options

1. **Track-local numbering** — each subsystem numbers its own milestones; "M10" is qualified by its track.
   Lets both existing documents stand unchanged. Every future reference must carry a qualifier that nobody
   will consistently write, and the first unqualified "M10" in a commit message reintroduces the ambiguity
   permanently.
2. **Renumber the programme so the Mission Engine becomes M10**, displacing *Hardening and 1.0*. Matches the
   most recent usage. Renumbers ten documented milestones, invalidates existing acceptance criteria and
   cross-references, and rewrites history that other documents already cite.
3. **Single global sequence; Mission Engine is M15; nothing already documented is renumbered.**
4. **Abandon numbers for names.** Removes the ambiguity and removes ordering, which is the property the
   sequence exists to express.

## Decision

Option 3, recorded in `/MILESTONE_REGISTRY.md`, which becomes the authoritative source for what every
milestone number means.

- M1–M14 stand unchanged.
- The Mission Engine is **M15**, per Appendix C's dependency argument.
- The "M10" label in the Mission Engine plan is withdrawn; that document's §0.2 Reading A is rejected.
- M16–M30 are defined in the registry.
- **Once a milestone is Documented — architecture plus implementation plan — its number is permanent.**
  Milestones that are merely Defined may still be renamed, split, or re-scoped.

## Consequences

**Accepted:** the Mission Engine plan now contains a withdrawn label in eleven places. It is not rewritten,
because it is a frozen planning artifact; the registry's translation table is the correction, and every
reader is routed to the registry first.

**Accepted:** T1.1's in-source comments cite "M10" for what is now M15. A stale reference in a comment is
cheaper than an edit to shipped source in a documentation-only turn, and it is listed as a known correction.

**Accepted:** a fifth authoritative document at the repository root. Justified because the alternative — the
numbering living in the master guide — is what produced the conflict, since the guide is one of the documents
that disagreed.

**Gained:** "M16" now has exactly one meaning, and so does every number after it.

**Gained:** the dependency argument wins over the labelling convenience. M15 sits after M14 because it
genuinely depends on M11–M13, and the number now says so.

**Gained:** an explicit rule against renumbering documented milestones, which is what stops this from
recurring the next time a subsystem wants a tidy number.

**Reversal cost:** high and rising. Every commit trailer, ADR and task identifier cites a number. This is a
decision to make now, and its lateness is the reason it is expensive rather than free — which is the actual
lesson of IR-10.
