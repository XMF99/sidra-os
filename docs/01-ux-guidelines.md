# UX Guidelines

Interaction laws for Sidra OS. These are testable rules, not aspirations.

## 1. The register

The building is a **control room at night**, not a showroom. Quiet, dense, instrumented, and confident.
It reports; it does not celebrate. Nothing in the interface is excited to see you.

Concretely: no confetti, no emoji, no exclamation marks, no "Great question!", no illustrations of robots,
no gradients used as decoration, no rounded-friendly mascot anything. The delight is in precision — a panel
that resizes at 60 fps, a palette that opens in 80 ms, a Brief that says exactly the right five things.

## 2. The ten laws

### L1 — State the answer first
Every surface leads with its conclusion. Briefs open with the recommendation. Findings open with severity.
Errors open with what happened. Scrolling for the point is a design failure.

### L2 — The keyboard is the primary interface
Every action is reachable in ≤2 keystrokes via ⌘K, and every frequent action has a direct binding. A
pointer-only affordance is a bug with a requirement id (UI-03). The pointer is for pointing at things, not
for reaching functionality.

### L3 — Never a bare spinner
Work in progress shows a plan: the steps, which one is running, who is doing it, elapsed time, and running
cost. If the system cannot say what it is doing, it should not have started.

### L4 — Provenance is always one keystroke away
⌘I on anything opens the Inspector: who produced it, with what model, from what sources, at what cost,
under what authority. Never hidden behind a developer mode.

### L5 — Density is respect
This user would rather see nine things than three. Use the space. Small type, tight leading, real tables,
no card grids with 40 px of padding around a single number. Whitespace is used to group, not to impress.

### L6 — Interrupt almost never
Three interruptions per day, maximum, and each must carry a decision. Everything else batches. See
[../04-engines/06-notification-system.md](../04-engines/06-notification-system.md).

### L7 — Every state is designed
Empty, loading, partial, stale, error, offline, degraded, and too-much-data. A screen is not done when the
happy path renders. Empty states are invitations with a specific next action, never a shrug.

### L8 — Motion explains, never entertains
Animation exists to show where something came from and where it went. Durations ≤240 ms for anything the
user is waiting on. `prefers-reduced-motion` removes all non-essential motion, and the interface remains
fully comprehensible without it.

### L9 — Honest about uncertainty
Confidence is displayed as a value, not implied by tone. Inferred content is visually distinct from
established content. The system says "I don't know" in plain words and names what would resolve it.

### L10 — Nothing is lost
Panel sizes, scroll positions, draft Directives, filter state, and open threads survive a restart. Closing
a window is never destructive. Undo exists for every reversible action.

## 3. Layout doctrine

- **Five regions**, always: Rail (56 px), Sidebar (240–400 px), Stage (flex), Inspector (280–480 px), Dock
  (48 px). Every room uses this frame; only the contents change. See
  [04-desktop-navigation.md](04-desktop-navigation.md).
- **Panels are resizable and collapsible**, and their sizes persist per room. Double-click a divider to
  reset.
- **The Stage never scrolls horizontally.** Wide content gets a horizontally scrolling sub-region with
  sticky headers.
- **Max content width for prose is 72ch.** Beyond that, reading collapses.

## 4. Information hierarchy

Four levels, and no more, on any screen:

1. **The answer** — largest type, first position, serif for documents.
2. **The support** — findings, evidence, structure.
3. **The machinery** — who did it, what it cost, when. Present but quiet.
4. **The affordances** — actions, always in the same places (primary bottom-right of a sheet, inline for
   list items, ⌘K for everything).

## 5. Latency and feedback

| Duration | Treatment |
|---|---|
| <100 ms | No feedback. It just happens |
| 100–500 ms | Optimistic update, subtle in-place indicator |
| 0.5–3 s | Skeleton of the real layout, never a generic spinner |
| 3–30 s | Progress spine with named steps |
| >30 s | Same, plus the Engagement becomes backgroundable; the Dock keeps it visible and notifies on completion |

Optimistic updates are used only where failure is recoverable and rare. Where a failure would be confusing,
show the true state instead.

## 6. Copy rules

- Sentence case everywhere. Never Title Case Buttons.
- Active voice, present tense: "Authorize", not "Submit for authorization".
- The same word for the same thing, always. The glossary is binding.
- Buttons name their outcome; the resulting toast uses the same verb in past tense.
- Errors: what happened, what it means, what to do. Never "an error occurred". Never an apology.
- Empty states: one sentence explaining what lives here, and one action.
- Numbers are formatted: money to the cent, durations human-readable ("4 m 12 s"), timestamps relative under
  24 h then absolute.

## 7. Accessibility floor

Non-negotiable, verified in CI where automatable:

- Contrast ≥4.5:1 for body text, ≥3:1 for large text and meaningful non-text.
- Visible focus ring on every interactive element, 2 px, high contrast, never removed.
- Full keyboard operation with a logical tab order and no traps.
- `prefers-reduced-motion` honoured throughout.
- Semantic roles and labels via Radix primitives; live regions for streaming content, throttled so a screen
  reader is not flooded by token streams.
- Text scales to 200% without loss of function.
- Never color alone to convey meaning — status always carries a shape or a label too.

## 8. Anti-patterns

| Banned | Why |
|---|---|
| Modal dialogs for anything non-blocking | They steal focus and stack badly |
| Toasts carrying information the user needs later | Transient UI for permanent facts |
| Infinite scroll | Nothing here is a feed |
| Hover-only affordances | Invisible to keyboard, invisible on touch |
| Skeleton screens that don't match the real layout | Lies about what is coming |
| Progress bars with invented percentages | Erodes trust in every other number |
| Badge counts without a decision behind them | Manufactured urgency |
| Chat as the primary interface | The whole product exists to escape it |
