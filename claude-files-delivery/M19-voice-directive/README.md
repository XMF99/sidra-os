# M19 — Voice Directive · Delivery Package

**For AntiGravity.** The complete architecture package for milestone M19 (Voice Directive), release 2.5
"Field". Architecture and specification only — **no production code**, per the workflow.

## What this milestone delivers

A **local speech-to-text input method** in front of the existing Directive intake. The Principal speaks; an
on-device ONNX/whisper-class model (shipped the way the `bge-small` embedding model is) transcribes the speech
to text inside the trusted core; the Principal confirms or edits the transcript; and it enters the **existing**
`engagement.create` command **unchanged**. Voice is an input front-end — not a voice assistant, not a second
Directive path, not a cloud pipeline. Downstream (Mandate, Workflow, Brief) is entirely untouched.

**Exit criterion:** a spoken Directive produces the **same Mandate** as the typed equivalent, and **audio never
leaves the device** — proven by test, not by configuration.

## Contents

| File | What it is |
|---|---|
| `00-M18-AUDIT.md` | STEP 1 gate: M18 is Defined (not Documented); it gates only the Companion voice surface (E5); the exit criterion is desktop-demonstrable against M6 (Documented) |
| `VOICE_DIRECTIVE_ARCHITECTURE.md` | The architecture — the authority on behaviour |
| `adr/0052-speech-to-text-is-local-audio-never-leaves-the-device.md` | Local-only STT; audio never leaves the device; voice produces a normal Directive |
| `adr/0053-transcript-is-confirmed-before-submit.md` | The transcript is confirmed/editable before submit, which makes "same Mandate as typed" achievable |
| `IMPLEMENTATION_PLAN.md` | E1–E6, tasks with complexity, dependencies, files, acceptance criteria, order |
| `REVIEW_CHECKLIST.md` | The gate confirming the package is complete and ready |

## The two decisions, in one line each

1. **Local-only STT (0052):** speech-to-text runs on-device through ONNX Runtime; audio never leaves the
   device (no `net.*` on `sidra-voice`, no cloud STT, model gateway off the path); the transcript enters the
   existing `engagement.create` — voice adds no Directive pipeline.
2. **Confirm before submit (0053):** the transcript is shown editable in the composer; equivalence is defined
   against the confirmed text, so a spoken Directive and the typed equivalent are the same string at
   submission — which is what makes the same-Mandate exit criterion hold.

## Numbering used

- **ADRs:** 0052, 0053 (Status `Proposed`; continue the sequence after 0037/M16 and the intervening
  allocations — do not exceed 0053).
- **Migrations:** `0037_directive_input_method.sql` (additive `input_method` column; `source` unchanged) and
  `0038_voice_captures.sql` (local audio-retention/provenance record; no audio bytes, no network reference).
  Both additive and forward-only; a Firm that never uses voice is byte-for-byte unaffected.

## Reading order

1. `00-M18-AUDIT.md` — why it is safe to start M19, and what M18 gates (E5 only)
2. `VOICE_DIRECTIVE_ARCHITECTURE.md` — §1–§6 for the stance and the one-pipeline model, then the ADRs
3. The two ADRs — the load-bearing decisions
4. `IMPLEMENTATION_PLAN.md` — what to build, in order
5. `REVIEW_CHECKLIST.md` — confirm ready before starting

## Integration notes for AntiGravity

- Copy the two ADRs to `docs-v2/adr/`, add rows to `docs-v2/adr/README.md`, mark `Accepted` on Principal
  approval.
- Migrations are `0037_` and `0038_` (additive; `input_method` defaults `'typed'`, `source` unchanged).
- Submission uses the **existing** `engagement.create` — there is **no** `voice.submit`. `sidra-voice` must
  not import `sidra-orchestrator`/`sidra-mission` and must hold **no** `net.*` capability (both CI-enforced).
- The desktop surface leads and carries the full exit criterion. When M18 is Documented, bind E5 (T5.*) to the
  Companion's real contract and run the AC10 slice.
- On completion, update `/MILESTONE_REGISTRY.md` M19 status `Defined → Documented`; the number is permanent
  from that point (registry rule 4).

**STOP.** Do not begin M20 (Executable Artifacts) until M19 is implemented, integrated, and the
spoken-Directive-equals-typed-Mandate / audio-never-leaves exit criterion is demonstrated — live or in a
recording, to someone who does not trust you (`/MASTER_IMPLEMENTATION_GUIDE.md` §6).
</content>
