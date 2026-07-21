# Plugin System

Extensibility without ambient authority. A plugin can add capability to the Firm; it can never quietly take
anything.

## 1. Why WebAssembly

| Option | Verdict |
|---|---|
| Native dynamic libraries | Rejected: full process authority, platform-specific, unsandboxable |
| A JS runtime in-process | Rejected: weak isolation boundary, and the renderer is untrusted by design |
| Subprocess with IPC | Viable but heavy; per-plugin process supervision and OS-level sandboxing differ per platform |
| **WASM Component Model (Wasmtime)** | **Chosen.** Deny-by-default (no syscalls unless bound), deterministic, fuel-metered, cross-language, one implementation across platforms |

Cost accepted: no threads, no arbitrary native libraries, and a marshalling boundary. For the plugin types
we want — tools, ingestors, panels, playbooks, themes — this is the right trade. See ADR-0006.

## 2. Extension points

| Point | What it adds | Interface |
|---|---|---|
| `tool` | A new capability agents can call | `run(input: json) -> json`, declared schemas + effect class |
| `ingestor` | Support for a new file type | `extract(bytes, mime) -> Document` |
| `retriever` | An alternate memory strategy | `retrieve(query, k) -> Chunk[]` |
| `panel` | A surface in the Stage or Inspector | Declarative view spec + scoped query subscription |
| `playbook` | A named procedure | YAML, no code |
| `workflow_template` | A reusable DAG | YAML, no code |
| `theme` | Token overrides only | CSS custom properties, validated against the token contract |
| `model_provider` | A new inference backend | `complete/stream/embed` |

Playbooks, workflow templates, and themes are **data**, not code: they install without a sandbox because
they cannot execute anything. This is the preferred extension path and covers most customization.

## 3. Manifest

```toml
[plugin]
id          = "com.example.linear"
name        = "Linear"
version     = "1.2.0"
api_version = "1"                 # Sidra plugin API major version
description = "Read issues and cycles from Linear."
author       = "Example"
license      = "MIT"

[[tool]]
name        = "linear.issues"
description = "List issues assigned in the current cycle."
effect      = 1
input_schema  = "schemas/issues.in.json"
output_schema = "schemas/issues.out.json"

[capabilities]
net    = ["api.linear.app"]       # exact hosts, no wildcards at the TLD level
fs     = []                       # no filesystem at all
secret = ["linear_api_key"]       # named secret, injected by the broker, never readable by the host app UI
events = ["work_order.accepted"]  # what it may subscribe to
limits = { fuel = 50_000_000, memory_mb = 64, wall_ms = 10_000, calls_per_min = 30 }

[ui]
panel = { id = "linear.cycle", room = "engineering", title = "Cycle" }
```

The manifest is the whole contract. Anything not declared is denied. There is no escape hatch, no "request
at runtime", no dynamic capability.

## 4. Install and consent

1. The Principal picks a `.sidraplugin` file (a zip: manifest, wasm, schemas, assets).
2. Signature and hash are verified. Unsigned plugins are allowed but the consent screen says so plainly.
3. **Consent screen** renders capabilities as sentences, not a JSON blob:
   - "It can reach api.linear.app over the network."
   - "It cannot read any of your files."
   - "It will be given your Linear API key. It cannot read your other keys."
   - "It can see when work orders are accepted."
   - "It can spend up to 10 seconds and 64 MB per call."
4. Install writes a `plugins` row, disabled. The Principal enables it explicitly.
5. Every capability grant is a recorded Decision, so "why can this thing reach the network?" is answerable.

## 5. Runtime

- One Wasmtime instance **per call**, then dropped. No cross-call state; persistence must go through a
  plugin-scoped key-value namespace mediated by the kernel.
- Fuel metering caps CPU; an epoch deadline caps wall time; linear memory is capped. Exceeding any limit
  terminates the call with a typed error the calling agent can handle.
- Host functions are the only bridge: `http_fetch` (allowlist-checked), `kv_get/kv_put` (namespaced),
  `log`, `secret_get` (only names declared in the manifest). Notably absent: filesystem, clock beyond
  coarse time, randomness beyond a seeded source, process, and sockets.
- All plugin calls appear in the trace exactly like built-in tool calls, with the plugin id attributed.

## 6. Panels

Plugin panels do not execute JavaScript in the renderer. They declare a view using a constrained schema
(rows, cards, lists, key-values, a small chart set) which the host renders with the native component
library. This keeps the design system coherent, keeps the renderer boundary intact, and makes plugin UI
automatically themable and accessible.

```json
{ "type": "list",
  "empty": "No issues in this cycle.",
  "items": [{ "title": "{{issue.title}}", "meta": "{{issue.state}}",
              "action": { "command": "directive.submit",
                          "params": { "body": "Summarize {{issue.identifier}}" } } }] }
```

Commands a panel may invoke are themselves capability-checked; a panel cannot trigger anything the plugin
could not do directly.

## 7. Versioning and lifecycle

- The plugin API is semver'd at the major level. A plugin declaring `api_version = "1"` will run on all 1.x
  hosts. Breaking changes require an ADR and a major bump.
- Plugins can be disabled instantly; disabling revokes secrets and cancels in-flight calls.
- Uninstall removes code and the KV namespace, and offers to keep or delete data the plugin created.
- Failure policy: a plugin that errors on 3 consecutive calls is auto-disabled with a notification. A
  plugin is never allowed to block an Engagement — its tools time out and the agent proceeds or escalates.

## 8. Not in 1.0

No marketplace, no auto-update, no remote install by URL, no plugin-to-plugin calls. Distribution is
file-based and deliberate. A marketplace is a trust system, and trust systems are 3.0 work.
