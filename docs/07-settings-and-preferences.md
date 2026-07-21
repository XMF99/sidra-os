# Settings and Preferences

Settings are where a product admits what it does not know about you. Sidra OS makes a decision for every
setting it ships and then exposes the lever anyway, because the Principal's judgement outranks ours. What we
refuse to do is offload a design problem onto a toggle: every setting below has a defensible default, and a
setting with no defensible default is a design bug, not a feature.

## 1. Rules for the settings surface

1. **Every setting has a default that is correct for a first-run Principal.** If a reasonable person must
   change it before the product works, it is not a setting — it is onboarding.
2. **Every setting states its consequence, not its mechanism.** "Agents may read files outside the Vault"
   rather than "enable extended FS capability scope."
3. **Nothing is hidden behind an advanced tier.** There is one Principal; there is no one to protect them
   from. Dangerous settings are marked, confirmed, and logged — never buried.
4. **Changes take effect immediately** and are written to the event log like any other act. `settings.changed`
   carries the key, old value, new value, and timestamp; the Console can show a diff of the Firm's
   configuration over time.
5. **No setting silently weakens a Fence.** Widening autonomy, egress, or filesystem scope requires an
   explicit confirmation sheet naming what becomes possible, and is re-confirmed after 30 days.
6. **Settings are searchable** (⌘K → "Go: Settings → *"), and every row is deep-linkable so a Brief can say
   "you can raise this in Settings → Budgets" and mean it as a link.
7. **Reset is always available** per section, not just globally.

The Settings room follows the standard room anatomy: Sidebar lists sections, Stage shows the section,
Inspector shows the rationale and the audit history for the focused setting. Preferences live in
`settings` (key/value with JSON Schema validation) and are mirrored to `~/Sidra/Records/settings.md` for
legibility — the mirror is read-only; the database is authoritative.

## 2. Sections

### 2.1 Firm

Who works here and how they behave.

| Setting | Default | Rationale |
|---|---|---|
| Active staff | All 11 | A department can be deactivated (e.g. Commercial) if the Principal never does that work. Deactivated agents keep their memory; reactivation is not a reset. |
| Executive name | Kai | Renaming is allowed. The `agent.exec` ID never changes, so history survives a rename. |
| Salutation | "Principal" is a system term, not a form of address | Kai addresses the Principal by their chosen name or by nothing. Titles in the UI copy are for the docs, not the dialogue. |
| Register | Professional | Alternatives: Terse (Briefs capped at 250 words, no preamble), Explanatory (one added paragraph of reasoning per section). Register never changes what is said, only its length. |
| Working hours | 09:00–18:00 local | Bounds automations and standup timing. Outside these hours, only `interrupt`-class notifications are delivered. |
| Standing meetings | Morning standup on, weekly review on | Both are cheap and both are load-bearing for memory consolidation; see [Meeting Engine](../04-engines/02-meeting-engine.md). |

### 2.2 Autonomy

The Fences. This is the most consequential section in the product and it is written in the second person.

| Setting | Default | Consequence of raising it |
|---|---|---|
| Approval threshold (spend) | $5 per Work Order | Above this, an Approval Request. Raising it means more work completes without you. |
| Approval threshold (effect class) | Class 3 always asks | Class 3 is irreversible-outside-the-Vault. This one cannot be disabled — it can only be tightened to also cover class 2. |
| Autonomous engagement depth | 2 levels of delegation | Kai → head → specialist. Raising to 3 permits specialists to sub-delegate; costs rise super-linearly. |
| Automations | Enabled, dry-run first | A new automation always runs in dry-run until the Principal approves one real execution. |
| Night Shift | Enabled, 03:00 local | Consolidation requires idle time and a small budget. Disabling it degrades memory quality within a week. |
| Egress allowlist | Model providers only | Every added host is named, justified in one line, and shown in the security digest. |
| Filesystem scope | `~/Sidra/` only | Read scope may be extended per-directory. Write scope outside the Vault is not offered in 1.0 at any setting. |

Tightening a Fence takes effect on the next Turn. Loosening one takes effect after a confirmation sheet that
lists, concretely, the first three things that become possible.

### 2.3 Budgets

| Setting | Default |
|---|---|
| Monthly ceiling | $150 |
| Warning threshold | 80% |
| Behaviour at 100% | `fast` class only, automations paused, constraint stated at the top of every Brief |
| Per-Engagement default | $8, overridable in the Mandate |
| Currency display | USD; local currency shown alongside if the OS locale differs |
| Cost visibility | Ledger Line always; per-Turn cost in the Inspector |

The ceiling is a real stop, not a warning. A product that lets a background process spend unbounded money on
the Principal's behalf has broken Principle 6 regardless of how good its output is.

### 2.4 Models and routing

| Setting | Default |
|---|---|
| Provider bindings | One binding per Model Class, configured at first run |
| Local models | Off; when a local runtime is detected, offered for `fast` and `embed` |
| Class overrides | None — the routing table decides |
| Escalation permitted | Yes, one class, twice per Turn |
| Offline behaviour | Local work continues; model-dependent Turns queue and the Dock shows the queue depth |

Keys are stored in the OS keychain, never in the database, never in the Vault, never in a log. The settings
row holds a reference, not a secret. Rotating a key is a first-class action with a "test binding" button that
makes exactly one cheap call.

### 2.5 Memory

| Setting | Default | Note |
|---|---|---|
| Episodic retention | 18 months, then summarise-and-tier | Nothing is deleted without an explicit act; tiering moves detail to cold storage inside the Vault. |
| Canon curation | Manual promotion, Kai proposes | Canon is the Firm's constitution. Automatic promotion would let a confident mistake become doctrine. |
| Retrieval breadth | Balanced | Narrow (fewer, higher-scoring chunks — cheaper, riskier gaps) / Broad (more context, higher cost). |
| Forget | Per-item, per-source, per-date-range | Forgetting a source removes derived chunks and marks dependent Decisions for review rather than silently invalidating them. |

### 2.6 Notifications

| Setting | Default |
|---|---|
| Interrupt permitted for | Approval Requests, blocked Engagements, budget at 100%, integrity failures, automation failures |
| Batch delivery | Twice daily: end of morning, end of working hours |
| Focus mode | Manual (⌘⇧D); auto-enables during screen share if the OS reports it |
| Sound | Off |
| System notifications when unfocused | On, for `interrupt` class only |

Five things may interrupt. That number is a budget, and adding a sixth requires removing one.

### 2.7 Appearance

| Setting | Default |
|---|---|
| Theme | Night Atrium (dark) |
| Light theme | Available; the token contract guarantees parity, and every component is QA'd in both |
| Accent | Brass; five alternates, all contrast-checked against every surface token |
| Density | Comfortable; Compact reduces row height and gutters by one step, never type size below 13px |
| Motion | Full; Reduced honours `prefers-reduced-motion` automatically and can be forced |
| Ledger Line | On | 
| Type scale | 100%; 90–130% supported without layout breakage |
| Agent hues | On — each agent's colour appears on avatars and message rails |

Reduced motion removes movement, never information: anything communicated by animation has a static
equivalent. See [Design System](02-design-system.md).

### 2.8 Vault and data

| Setting | Default |
|---|---|
| Vault location | `~/Sidra/` |
| Encryption | On, SQLCipher, key in OS keychain |
| Auto-lock | After 30 minutes idle, or on system sleep |
| Markdown mirror | On |
| Backup reminder | Weekly, if no external copy of the Vault has been detected |
| Export | Full export any time: database + mirrors + manifest, no proprietary format |
| Integrity check | On launch (chain head), full verification weekly |

Moving the Vault is supported and atomic: the new location is written, verified, and only then is the old one
released.

### 2.9 Plugins

| Setting | Default |
|---|---|
| Plugins | Enabled, none installed |
| Capability grants | Per-plugin, explicit, revocable, shown as a plain-language list |
| Auto-update | Off — an update can request new capabilities, which is a decision, not a maintenance task |
| Unsigned plugins | Blocked; installable only via an explicit developer-mode toggle that is logged and expires in 7 days |

### 2.10 Privacy

There is no telemetry setting, because there is no telemetry. This section states that plainly, lists every
network destination the app will contact and why, and offers a one-click "network report" showing every
egress in the last 30 days with byte counts. The best privacy control is a verifiable claim.

### 2.11 Advanced and diagnostics

Diagnostics bundle export (redacted by default, with a preview of exactly what leaves), event-log inspector,
migration history, database vacuum, cache statistics and clear, error-code reference, and a "reset the Firm"
action that requires typing the word and produces a full export first.

## 3. First-run configuration

Six screens, none skippable, none longer than one decision:

1. **Vault location and passphrase.** Explains encryption in two sentences and the recovery consequence in
   one: there is no recovery, so write it down.
2. **Model provider.** One binding minimum; the routing table fills the rest.
3. **Monthly budget.** $150 pre-filled with the reasoning shown.
4. **Working hours.**
5. **What are you working on?** Free text, one paragraph. This seeds Canon and is the single highest-leverage
   input the Principal ever gives.
6. **First Directive.** Pre-filled with something genuinely useful based on step 5, editable, and running it
   is the last step of setup. The product must prove itself in the first ninety seconds.

## 4. What is not a setting

- **Whether Briefs are honest about uncertainty.** Principle 9 is not optional.
- **Whether class-3 effects require approval.**
- **Whether actions are logged.** A system whose audit trail can be disabled has no audit trail.
- **Whether the reviewer differs from the author.** Principle 5 is structural.
- **Chat mode.** There is no toggle that turns Sidra OS into a chatbot; the fast lane already covers the case
  where delegation would be overhead, and it still produces a record.
