# Keyboard Shortcuts

The pointer is optional. This is the full keymap. macOS bindings shown; Windows/Linux substitute Ctrl for ⌘
and Alt for ⌥.

## 1. Global

| Keys | Action |
|---|---|
| ⌘K | Command palette |
| ⌘⇧F | Search everywhere |
| ⌘Return | Directive bar (new directive to Kai) |
| ⌥Return | Directive bar in direct-address mode (`@`) |
| ⌘I | Toggle Inspector on the current selection |
| ⌘. | Interrupt the running Engagement (pause after the current Turn) |
| ⌘⇧D | Toggle Focus mode |
| ⌘⇧L | Lock the Vault |
| ⌘, | Settings |
| ⌘⇧N | New window |
| ⌘W / ⌘Q | Close window / Quit |
| F1 | Keyboard shortcut reference (this map, searchable) |

## 2. Navigation

| Keys | Action |
|---|---|
| ⌘1 … ⌘9 | Lobby, Boardroom, Engineering, Product, Commercial, Operations, Archive, Vault, Console |
| ⌘[ / ⌘] | Back / forward through visited subjects |
| ⌘⌥← / → | Previous / next item in the Sidebar list |
| ⇥ / ⇧⇥ | Move focus between panels |
| ⌘\ | Toggle Sidebar |
| ⌘⇧\ | Toggle Dock expansion |
| ⌘0 | Reset all panel sizes for this room |

## 3. Working with an Engagement

| Keys | Action |
|---|---|
| ⌘⏎ (in Mandate preview) | Authorize |
| ⌘E | Edit the Mandate |
| ⌘⇧R | Re-plan (re-strategize from the current state) |
| Space | Expand / collapse the focused spine node |
| ⌘T | Open the trace for the focused step |
| ⌘⇧A | Open pending approvals |
| 1 … 9 (in Approval sheet) | Select item N |
| ⌘⏎ (in Approval sheet) | Grant all shown |
| ⌘⌫ | Abandon the Engagement (confirms) |

## 4. Briefs and records

| Keys | Action |
|---|---|
| 1 … 5 (in a Brief) | Act on item N |
| ⌘⇧K | Mark the Brief read |
| ⌘D | Record a Decision from the current context |
| ⌘⇧M | Convene a meeting about the current subject |
| ⌘⇧C | Copy the current record as Markdown |
| ⌘P | Export / print the current document |

## 5. Vault and memory

| Keys | Action |
|---|---|
| ⌘⇧O | Ingest files |
| ⌘⌥O | Ingest a URL |
| ⌘⇧V | Reveal the selected file in Finder/Explorer |
| ⌘⇧H | Version history for the selected artifact |
| ⌘⇧⌫ | Forget the selected memory item (confirms) |
| ⌘G / ⌘⇧G | Next / previous match within a document |

## 6. Tables and lists

| Keys | Action |
|---|---|
| ↑ ↓ | Move |
| ⇧↑ ⇧↓ | Extend selection |
| ⌘A | Select all |
| ⏎ | Open |
| ⌘⏎ | Open in Inspector |
| ⌥⏎ | Start a Directive with this as context |
| / | Focus the filter field |
| ⌘F | Find within the list |

## 7. Text fields

Standard platform editing throughout, plus:

| Keys | Action |
|---|---|
| ⌘⏎ | Submit |
| Esc | Cancel, preserving the draft |
| ⌘Z / ⌘⇧Z | Undo / redo |
| ⌃Space | Reference autocomplete (`@agent`, `#room`, artifact and Canon ids) |

## 8. Design rules

1. **⌘ for global, ⌘⇧ for less-frequent variants, ⌥ for modifiers on the current action.** No ⌃ bindings on
   macOS except text editing, which belongs to the platform.
2. **Nothing destructive on a single key** and nothing destructive without a confirm that names what will be
   destroyed.
3. **No binding conflicts with the OS** — verified per platform in CI against a list of reserved
   combinations.
4. **Every binding appears in three places**: the command palette row, the tooltip of its button, and F1.
5. **Remappable** (P1). Conflicts are detected at assignment and shown before saving; the reset-to-defaults
   path is one action.
6. **Discoverable by holding ⌘** for 1.2 s: available bindings for the current context fade in over their
   controls. Once, subtly, and never again in that session.

## 9. Reserved and deliberately unbound

`⌘S` is unbound — nothing here needs saving, everything is persisted. Pressing it shows a one-line
confirmation that the current state is already saved, because a user with the habit deserves an answer
rather than silence.

`⌘N` is unbound — "new" is ambiguous in a system with eleven kinds of record. ⌘Return (new Directive) is the
answer to almost every case, and ⌘K covers the rest.
