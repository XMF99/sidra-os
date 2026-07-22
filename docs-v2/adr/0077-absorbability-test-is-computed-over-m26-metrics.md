# ADR-0077 — The absorbability test is Principle 13's test computed over M26 measured metrics, never an opinion

**Status:** Accepted · **Date:** 4.0 "Continuum" design phase · **Supersedes:** —

## Context

Principle 13 says structure must be earned by evidence and names the instrument: *"if a department's Work
Orders could be absorbed by a neighbouring department without a measured drop in Deliverable quality, the
department is overhead"* (`/docs-v2/02-v2-principles.md` §13). The Master Guide names the same thing as the
response to failure mode 5 — *"Structure without evidence… a department whose Work Orders a neighbour could
absorb with no measured quality drop,"* answered by *"Principle 13, enforced at the quarterly Structure
Review"* (`/MASTER_IMPLEMENTATION_GUIDE.md` §10.5).

M29 makes that review a machine (ADR-0076: it proposes, never enacts). But once a machine assesses whether a
department "earned its overhead" and whether a neighbour "could absorb" it, the load-bearing question becomes:
**on what basis?** The principle is explicit — *"a measured drop in Deliverable quality"* — yet the tempting
implementations are not measured at all. A reviewer could rank departments by a model's judgement of their
importance, by budget alone, or by a hand-tuned "overhead score." Each produces a verdict that reads like the
Principle-13 test but is not it: it is the "structure by opinion" the principle was written against, wearing
the reviewer's face. A confidently-wrong "retire this department," built on judgement rather than measurement,
spends the Principal's scarcest resource (Principle 1) on a fiction and can end a department that was in fact
earning its keep.

M26 (Outcome Calibration) shipped the substrate that makes the answer objective: Mission outcome records,
per-department quality signals, and calibrated estimates — the KPIs the catalogue already declares per
department (`/docs-v2/04-department-catalog.md`), turned into inspectable numbers rather than dashboard
decoration. The department substrate (M13) and the budget ledger (`/docs/04-database-design.md`) supply the
overhead half. The open question: **what is the absorbability test, mechanically, such that it is Principle
13's own test and not a novel score — and what does M29 do when the measurement to run it does not exist?**

## Options

1. **A judgement score.** Rank each department by a model's or a heuristic's estimate of how essential it is,
   and propose retiring the low-ranked. Cheap and always produces a verdict — but it is not measured, it is
   not replayable, and it is precisely failure mode 5: structure decided by opinion. A retire built on it has
   no evidence to show the Principal.
2. **Budget share alone.** Call a department overhead if it spends more than its peers. Measured, but it
   measures the wrong thing: an expensive department (Cybersecurity) can be entirely earned, and a cheap one
   can be fully absorbable. Budget is one input to overhead, not the absorbability verdict.
3. **The absorbability test computed over M26 metrics, evidence mandatory, thin evidence flagged.** A
   department is `Absorbable` only when a **Division neighbour** is at least as good, **measured**, on
   comparable Work Orders — `quality_drop = measured_quality(D) − projected_quality(absorber) ≤ 0`, both drawn
   from M26 outcome records. Every emitted health line and every proposal names the M26 records / ledger rows
   behind it (`EvidenceRef`); a line that cannot cite its evidence is not written, and a proposal without
   evidence is not raised. Where M26 has too few comparable concluded Work Orders to decide (below a declared
   evidence floor), the verdict is `InsufficientEvidence` and the line is flagged low-confidence — never a
   guess.
4. **Compute it, but guess when evidence is thin.** As option 3, but fill a low-data department with an
   inferred verdict so every department gets a clean answer. Rejected: a verdict without measurement is not
   Principle 13's test, and a fabricated "retire" is the exact defect the review exists to prevent, applied to
   itself.

## Decision

**Option 3.** The absorbability test is Principle 13's exact wording turned into arithmetic over M26's
measured metrics, and measured evidence is a precondition of every emitted line.

Concretely (architecture §5, §8):

1. **Overhead is measured**, assembled from three ledger-backed sources: the department's budget share over the
   quarter (the budget ledger), its Principal-attention cost (the Approval Requests and Brief lines it
   generated — Principle 1's currency), and its coordination cost (cross-department `department.request` traffic
   through the Exchange).
2. **Quality is measured**, read from M26 outcome records: Deliverable quality, rework rate, review rejection
   rate, defect-escape rate over the quarter — the catalogue's declared per-department KPIs.
3. **`earned_overhead`** compares the two against the department's own history and its Division peers — *did
   this quarter's measured quality justify this quarter's measured overhead?*
4. **Absorbability** compares a department `D` to its Division neighbours only (Principle 13's *"neighbouring
   department"*; the Registrar resolves the Division roster). Comparable Work Orders are matched by declared
   capability requirements, never by department identity (kernel neutrality). `D` is `Absorbable` **iff** a
   neighbour's measured quality on comparable Work Orders is at least `D`'s — `quality_drop ≤ 0` — with
   evidence above the floor. A Division of one (e.g. Cybersecurity) has no neighbour and is never `Absorbable`.
5. **Evidence is mandatory.** Every `DepartmentHealth` row and every `StructureProposal` carries a non-empty
   `EvidenceRef` set; the pipeline refuses to emit one that cannot name its M26 records. Below the declared
   evidence floor (a minimum count of comparable concluded Work Orders), the verdict is `InsufficientEvidence`,
   the confidence is flagged, and **no proposal is raised**.

The test is **conservative by construction**: it errs toward `NotAbsorbable` / `InsufficientEvidence` and
toward *not* raising a proposal, because a false "retire" wastes the Principal's attention while a false "keep"
merely defers a finding to next quarter. The inputs are M26 records, asserted at test time (the
"absorbability-uses-M26-metrics" CI test), so the test cannot silently drift into a novel score.

## Consequences

**Accepted: a young or rarely-used Firm gets mostly `InsufficientEvidence`.** A department with too few
concluded Missions this quarter cannot be judged, and its health line says so. The first few quarterly reviews
of a new Firm may be largely "we cannot yet tell" — which is the honest and correct output, not a failure
(architecture §10, G4).

**Accepted: the test under-counts absorbable departments.** Requiring a neighbour to be *measurably* at least
as good, on comparable Work Orders, above an evidence floor, means some intuitively-overhead departments are
reported `NotAbsorbable` for want of a clean comparison. That is the safe direction: the failure mode is a
finding deferred, never a department wrongly retired.

**Accepted: overhead and absorbability are two questions, and both are reported.** A department can have high
overhead and still earn it (Cybersecurity is expensive and irreplaceable); a department can have low overhead
and still be absorbable (a neighbour does the same work as well for less). The assessment reports both rather
than collapsing them into one score, which is more to read but truer to Principle 13.

**Gained: every verdict is inspectable back to its evidence.** Because each line names its M26 records and
ledger rows, the Principal can follow any "earned"/"absorbable" conclusion to the Missions and ledgers behind
it (`inspect_assessment`, `proposal_evidence`; G6). The review is auditable, not an oracle.

**Gained: the test is Principle 13's test, not a rival metric.** "The same procedure" for structure — *could a
neighbour absorb these Work Orders with no measured quality drop* — is computed, model-free, and replayable:
given the same concluded Missions and ledgers, the same verdict is produced forever. Failure mode 5 is answered
with a number the Principal can check, not an opinion they must trust.

**Reversal cost: moderate.** Loosening the test — accepting judgement in place of measurement, or dropping the
evidence floor — would reintroduce the "structure by opinion" the review exists to eliminate and would
directly contradict Principle 13's *"measured drop."* It would also require weakening the CI assertion that the
absorbability inputs are M26 records. Because the mandatory-evidence rule is load-bearing for the whole
milestone's honesty, changing it is a boundary change requiring its own ADR, before any code relaxes it.
