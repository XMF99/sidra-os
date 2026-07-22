# ADR-0053 — The transcript is confirmed before submit; equivalence is defined against the confirmed text

**Status:** Proposed · **Date:** M19 design phase · **Supersedes:** —

## Context

M19's exit criterion is that a spoken Directive produces the **same Mandate** as the typed equivalent. ADR-0052
settles that transcription is local and feeds the existing Directive pipeline. But there is a gap ADR-0052 does
not close: speech-to-text is lossy and non-deterministic in a way typing is not. A model can drop a "not,"
choose the wrong homophone, or mangle a proper noun. If the Firm formed a Mandate from the *raw* transcript,
"same Mandate as typed" would be false the first time the model misheard — the spoken Directive would produce a
Mandate for a *different sentence* than the one the Principal spoke.

The typed path has no such gap: what the Principal types is what is submitted, exactly. To make voice
equivalent, the spoken path needs a moment where the text becomes exactly what the Principal intends — before
it becomes a Directive.

The system already has the right surface for this. The Directive composer is where typed Directives are
written and edited before submission. The renderer receives streamed text today (`/docs/01-technical-architecture.md`
§8) and Mandate fields are "editable in place" before authorization (`/docs/04-ceo-protocol.md` Phase 2) — the
product's whole posture is *show the Principal what will happen and let them correct it before it is committed*.
Honest uncertainty is the house style: the injection-defense surfaces what it ignored (`/docs/07-security-model.md`
§7.4); the Brief states confidence per finding (`/docs/04-ceo-protocol.md` Phase 6). A transcript the model is
only 90% sure of should be shown as text the Principal can fix, not acted on silently.

## Options

1. **Auto-submit the raw transcript.** Fastest; feels magical when it works. It makes "same Mandate as typed"
   false whenever the model mishears, converts every transcription error into a wrong Mandate (and possibly a
   wrong plan, spend, and Brief), and hides the model's uncertainty from the one person who can resolve it.
2. **Auto-submit, but let the Principal correct *afterward*.** The Directive is already formed from the wrong
   text; correction means killing an Engagement and re-issuing. Wasteful, and it still means the first Mandate
   was for a sentence the Principal never said.
3. **Show the transcript in the composer, editable, and submit only on explicit confirmation.** The Principal
   sees the text, fixes any mishearing, and submits exactly as they submit typed text. Equivalence is defined
   against the confirmed string, so it holds by construction: at submission, the spoken and typed inputs are
   the same string.
4. **Confidence-gated confirmation** — auto-submit above a confidence threshold, confirm below it. Removes a
   step sometimes, at the cost of a threshold that is wrong in both directions (submits confident-but-wrong
   transcriptions; nags on correct low-confidence ones) and a "same Mandate as typed" claim that holds only
   above the threshold.

## Decision

**Option 3.** The final transcript is shown in the ordinary Directive composer as **editable text**. The
Principal reviews it, edits it if the model misheard, and submits it through the **same** `engagement.create`
they use for typed text. Nothing is submitted from any state but this confirmed `Draft` (state machine §5).
**Equivalence is defined against the confirmed transcript**: the M19 claim is that voice does not *change* the
Mandate relative to typing the same confirmed text — and the confirm step makes the two inputs identical at the
moment of submission.

There is no confidence gate and no auto-submit. Every spoken Directive passes through a visible, editable
transcript, because the cost of the step (one glance) is far below the cost of a Mandate for a sentence the
Principal did not say.

## Consequences

**Accepted: voice is not fully hands-free.** The Principal must glance at and confirm the transcript rather than
speak-and-forget. This is a deliberate tax: it is the difference between an input method and a voice assistant
that acts on what it thinks it heard. For a system that forms plans and spends money from a Directive, confirm
is the right default and hands-free is the wrong one.

**Accepted: the confirm step is friction on the happy path.** Even a perfect transcription must be confirmed.
We accept a small, uniform cost to make the guarantee uniform — "same Mandate as typed" with no asterisk beats
"same Mandate as typed, above 85% confidence."

**Gained: the exit criterion becomes achievable and testable as an equality.** Because equivalence is defined
against the confirmed text, the test feeds an identical confirmed string down the voice and typed paths and
asserts the same Mandate (AC1). Without this ADR, the test would have to assert something about a lossy model's
output, which is not a stable contract.

**Gained: mishearing is a UI correction, never a wrong Mandate.** A dropped "not" is fixed in the composer in
one edit; it never reaches classification, staffing, or spend. This is the honest-uncertainty posture applied
to input: show what the model produced, let the Principal own the final text.

**Gained: consistency with the composer and the Mandate-edit pattern.** Voice reuses the composer's existing
edit-before-submit surface and mirrors the Mandate's edit-before-authorize rule (`/docs/04-ceo-protocol.md`
Phase 2). No new interaction concept is introduced.

**Reversal cost: low.** Auto-submit or a confidence gate could be added later as a Principal preference without
schema change — but doing so would reopen the "same Mandate as typed" guarantee, so it would require revisiting
this ADR and the exit criterion. The mechanism is cheap to change; the guarantee is not, which is the correct
place to put the friction.
</content>
