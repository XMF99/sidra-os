# ADR-0062 — The kernel is extracted as a hosted process behind a new `apps/` binary, with the transport as the only change

**Status:** Proposed · **Date:** 3.0 "Chambers" design phase (M23) · **Supersedes:** —

## Context

The 1.0 topology is one OS process: a Rust kernel and an untrusted webview inside a single Tauri application
(`/docs/01-technical-architecture.md` §1, §3). ADR-0011 chose a domain-oriented monorepo precisely so that
this topology would not be baked into the tree — `apps/` holds launchable products, `services/` holds the
kernel's capabilities one crate each, and the dependency direction runs `packages/domain ← services/* ←
apps/*` (`/docs/03-folder-structure.md` §1.7). ADR-0011 states the payoff in a single sentence: *"Extracting
the kernel to a server is selecting a subset of `services/` and adding a binary under `apps/`, with no file
moved and no import rewritten."* ADR-0001 made the same promise from the shell direction: Rust as the core
language so that *"the same crate becomes the 3.0 server binary."*

3.0 "Chambers" is the release where the Firm admits colleagues (`/MILESTONE_REGISTRY.md` §3). More than one
human needs to reach the same kernel, from more than one surface — the desktop today, the Companion (M18) and
additional Seats (M21) tomorrow. A shared kernel that only one in-process renderer can reach cannot serve
them. M23's exit criterion is uncompromising: **the kernel runs headless; the desktop app becomes one client;
no file moved, no import rewritten** (`/MILESTONE_REGISTRY.md` §4).

The question this ADR settles is *what kind of change M23 is.* There is a strong gravitational pull, whenever
a monolith is split, toward reorganising the source tree to "look like" a client/server system — moving
`services/*` under a `server/` root, carving a `shared/` crate out of `packages/domain`, splitting the
command registry into a "remote" half. Every one of those moves is a lie about what ADR-0011 already
accomplished, and every one of them rewrites imports that were correct.

## Options

1. **Reorganise the tree into client and server roots.** Create `server/` and `client/`, move the kernel
   crates under `server/`, and split shared types into a new crate. Familiar shape; matches how a project that
   *had not* planned the extraction would do it. It moves dozens of files, rewrites every import that crosses
   the new boundary, invalidates commit trailers and `git blame`, and — most damning — it contradicts the two
   ADRs that were adopted before M1 specifically to make this move a non-event. It also produces a diff so
   large that the one claim M23 exists to prove ("nothing had to change") becomes unverifiable.
2. **Fork the kernel into a second codebase.** A standalone server repository that vendors or copies the
   `services/*` crates. Maximal isolation; guarantees drift, double-maintenance, and two audit chains — exactly
   the split ADR-0021 refused for Seats and the event log. Rejected on sight.
3. **Add a new binary under `apps/` that hosts the existing `services/*` crates unchanged, and add a
   transport; change nothing else.** The kernel becomes a headless process because a new `apps/kernel-server`
   crate calls the same `sidra-kernel` entry point the desktop's `sidra-app` calls today, over a network/RPC
   boundary instead of in-process Tauri IPC. `services/*` and `packages/*` are not touched. The desktop's
   `sidra-app` keeps its Tauri shell and its renderer; only the layer that used to dispatch commands
   in-process now dispatches them over the transport. The diff is: one added crate, one added transport
   adapter, and the desktop's dispatch swapped for the client of that transport.

## Decision

Option 3. **M23 is a topology and packaging change, not a source reorganisation.**

- A new crate `apps/kernel-server` (binary `sidra-kernel-server`) is **added**. It is a thin host: it
  constructs the same `Kernel` the desktop constructs today (`/docs/01-technical-architecture.md` §6), opens
  the Vault, and serves the command/query/event surface over the transport (ADR-0063). It contains no
  business logic — every capability it exposes already lives in `services/*`.
- `services/*` and `packages/*` are **unchanged** — not one file moved, not one import rewritten. This is
  possible because those crates already have "no dependency on Tauri and no knowledge of which process they
  run in" (`/docs/03-folder-structure.md` §1.2), which is the property ADR-0011 required of them from M1.
- `apps/desktop` **stays where it is.** Its `sidra-app` crate keeps the Tauri shell, the window, the tray, the
  updater, and the renderer. The single seam that changes is its command dispatch: where it called the kernel
  in-process it now calls the kernel over the transport as a client. The generated `commands.ts` /
  `packages/bindings` surface it presents to the renderer does not change shape (ADR-0063).
- The change is **proven, not asserted.** A CI assertion (§20 of the architecture) fails the build if the M23
  changeset touches any file under `services/` or `packages/` other than additively, or rewrites an import
  across the dependency direction. The headline deliverable of this milestone is a diff that a reviewer can
  read in one sitting and confirm: only an `apps/` binary and a transport were added.

The kernel that runs headless and the kernel that runs inside the desktop are the **same crate graph**. There
is one `sidra-kernel`, one set of `services/*`, one `packages/domain`. The topology — how many processes,
reachable over what boundary — is now a deployment choice, not a source-tree fact.

## Consequences

**Accepted: a running process with no window.** `apps/kernel-server` is the first product surface in the tree
that a person does not "launch" in the desktop sense (`/docs/03-folder-structure.md` §1.1 defines `apps/` as
"things a person launches"). We accept a mild strain on that definition: a server is launched, by an operator
or a service manager, just not by double-clicking. The folder-structure note is updated to say so; the crate
still belongs in `apps/` because it is a top-level deployable, which is what `apps/` means once the topology
is no longer single-process.

**Accepted: two ways to run the same kernel.** From M23 the kernel can run in-process (desktop, unchanged) or
hosted (`kernel-server`). Two code paths reach the same `Kernel::dispatch`, and a bug that appears only over
the transport is a new class of bug. Bounded by ADR-0063's rule that the transport is a thin envelope over the
identical surface, and by a transport-equivalence test (§20) that asserts an RPC call and an in-process call
produce byte-identical results for the same input.

**Accepted: the desktop gains a dependency on a running kernel.** In 1.0 the desktop *was* the kernel; from
M23 a hosted deployment means the desktop client can be pointed at a kernel it does not own. For the exit
criterion and the default single-user deployment, the desktop still launches and supervises a local kernel —
so the out-of-the-box experience does not regress. The hosted case is opt-in and is what makes colleagues
possible.

**Gained: ADR-0011 and ADR-0001 pay off exactly as designed.** The two decisions taken before M1 — the
domain-oriented tree and the Rust core reusable as a server — were justified almost entirely by this
milestone. M23 collects the debt those ADRs took on. The proof that they were right is that M23 is small.

**Gained: one history, one chain, one source of truth.** Because nothing forked and nothing moved, the event
log (ADR-0002), the audit chain, and the Vault remain single and canonical whether the kernel runs headless or
in the desktop. This is the same "do not split the Firm's history" argument ADR-0021 made for Seats.

**Gained: a provable claim.** "Nothing in the source tree had to change" is normally a thing an architect
asserts and a reader takes on faith. Here it is a CI gate. The milestone's value is legible in its diff.

**Reversal cost: low, and it drops toward zero the more faithfully Option 3 is followed.** Because the
extraction adds rather than moves, reverting M23 is deleting the `apps/kernel-server` crate and pointing the
desktop's dispatch back at the in-process kernel — the `services/*` and `packages/*` crates it would revert to
are the same crates that never changed. Had we taken Option 1, reversal would mean moving every file back;
Option 3 makes reversal a subtraction.
