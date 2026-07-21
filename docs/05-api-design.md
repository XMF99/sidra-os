# API Design

Three surfaces: the **Command/Query API** between renderer and kernel (1.0), the **Tool API** between agents
and capabilities (1.0), and the **HTTP API** that the same kernel will expose in 3.0. All three share one
type system, generated from the Rust domain crate.

## 1. Conventions

- **Commands** mutate; imperative `subject.verb`. **Queries** read; `subject.list|get|search`.
- Every call carries a `request_id` (ULID) for tracing and idempotency.
- Errors are typed, never strings:
  ```ts
  type ApiError = {
    code: "not_found" | "conflict" | "unauthorized" | "fenced" | "budget_exceeded"
        | "validation" | "unavailable" | "internal";
    message: string;        // one plain sentence, shown to the Principal
    detail?: unknown;       // structured, for the UI
    retryable: boolean;
    suggested_action?: { label: string; command: string; params: unknown };
  }
  ```
- Long operations return immediately with a handle; progress arrives as events. No command blocks >200 ms.
- Pagination is cursor-based (`after_seq`, `limit`). No `OFFSET` anywhere.
- All timestamps epoch-ms UTC; all money integer cents.

## 2. Command surface

### Engagement and direction

| Command | Params | Returns | Notes |
|---|---|---|---|
| `directive.submit` | `{ body, addressed_to?, priority?, attachments? }` | `{ engagement_id }` | Persists before any model call |
| `mandate.authorize` | `{ engagement_id, mandate_patch? }` | `{ workflow_id }` | Patch lets the Principal edit fields inline |
| `mandate.reject` | `{ engagement_id, reason }` | `{}` | Moves to `abandoned`, retains the record |
| `engagement.clarify` | `{ engagement_id, answers[] }` | `{}` | Answers to Kai's ≤3 questions |
| `engagement.interrupt` | `{ engagement_id, mode: "pause"\|"abandon" }` | `{}` | Halts after the current Turn |
| `engagement.resume` | `{ engagement_id, revision? }` | `{}` | |
| `brief.mark_read` | `{ brief_id }` | `{}` | Feeds the attention model |
| `brief.act` | `{ brief_id, item_id, action }` | `{ engagement_id? }` | Take / Delegate / Defer / Dismiss |

### Work and staff

| Command | Params | Returns |
|---|---|---|
| `work_order.reassign` | `{ work_order_id, agent_id, reason }` | `{}` |
| `work_order.cancel` | `{ work_order_id, reason }` | `{}` |
| `work_order.escalate` | `{ work_order_id, note }` | `{}` |
| `agent.address` | `{ agent_id, body }` | `{ engagement_id }` |
| `agent.set_fence` | `{ agent_id, capabilities[], spend_ceiling_cents }` | `{ decision_id }` |

### Governance

| Command | Params | Returns |
|---|---|---|
| `approval.respond` | `{ request_id, granted, scope: "once"\|"session"\|"always", note? }` | `{}` |
| `decision.record` | `{ … }` | `{ decision_id }` |
| `decision.supersede` | `{ decision_id, new_decision }` | `{ decision_id }` |
| `meeting.convene` | `{ kind, agenda, attendees[], budget_cents }` | `{ meeting_id }` |
| `meeting.close` | `{ meeting_id }` | `{ minutes_id }` |

### Memory and files

| Command | Params | Returns |
|---|---|---|
| `memory.ingest` | `{ paths[] \| url, treatment }` | `{ job_id }` |
| `memory.forget` | `{ target_type, target_id, purge: bool }` | `{}` |
| `canon.assert` | `{ subject, statement, confidence, source }` | `{ canon_id }` |
| `canon.reconcile` | `{ reconciliation_id, resolution }` | `{}` |
| `artifact.save` | `{ engagement_id, path, bytes, kind, title }` | `{ artifact_id, version }` |
| `artifact.export` | `{ artifact_id, format }` | `{ path }` |

### System

| Command | Params | Returns |
|---|---|---|
| `trigger.create` / `update` / `disable` | `{ … }` | `{ trigger_id }` |
| `budget.set` | `{ scope, period, ceiling_cents }` | `{}` |
| `preference.set` | `{ key, value }` | `{}` |
| `plugin.install` / `enable` / `disable` | `{ … }` | `{}` |
| `vault.snapshot` | `{}` | `{ path }` |
| `audit.verify` | `{ from_seq?, to_seq? }` | `{ ok, first_break_seq? }` |

## 3. Query surface

| Query | Params | Returns |
|---|---|---|
| `engagement.list` | `{ status?, after_seq?, limit }` | `EngagementSummary[]` |
| `engagement.get` | `{ id, include: ["mandate","orders","brief","timeline"] }` | `EngagementDetail` |
| `search.everywhere` | `{ q, types?, limit }` | `SearchResult[]` grouped by type, two-wave |
| `memory.retrieve` | `{ q, k, filters }` | `Chunk[]` with scores and provenance |
| `trace.get` | `{ turn_id }` | `Turn` + context items + tool calls |
| `cost.summary` | `{ period, group_by }` | `CostRow[]` |
| `agent.get` | `{ id }` | charter, KPIs, live load, recent Turns |
| `notification.list` | `{ unread_only? }` | `Notification[]` |
| `vault.tree` | `{ path }` | `FileNode[]` |

## 4. Events (kernel → renderer)

Push-only, ordered by `seq`, resumable from a cursor.

```ts
type Event =
  | { kind: "engagement.status_changed"; engagement_id: string; from: Status; to: Status }
  | { kind: "mandate.proposed";          engagement_id: string; mandate: Mandate }
  | { kind: "work_order.status_changed"; work_order_id: string; to: WoStatus; agent_id: string }
  | { kind: "turn.started" | "turn.committed"; turn: TurnSummary }
  | { kind: "turn.token";                turn_id: string; delta: string }   // coalesced ≤30 Hz
  | { kind: "tool.call";                 tool_call: ToolCallSummary }
  | { kind: "review.completed";          verdict: Verdict; findings_count: number }
  | { kind: "approval.requested";        request: ApprovalRequest }
  | { kind: "brief.ready";               brief_id: string }
  | { kind: "budget.threshold";          scope: string; pct: number }
  | { kind: "memory.indexed";            document_id: string; chunks: number }
  | { kind: "notification.created";      notification: Notification }
  | { kind: "system.recovered";          resumed: number; escalated: number };
```

**Renderer contract.** The UI holds no authoritative state. It renders a projection of queries plus events.
Reconnect = re-query + replay from `since_seq`. This is what makes a webview reload lossless.

## 5. Tool API (kernel ↔ agents)

Every tool is declared with a schema, a required capability set, and an effect class.

```rust
pub struct ToolSpec {
    pub name: &'static str,            // "web.fetch"
    pub description: &'static str,     // shown to the model
    pub input_schema: JsonSchema,
    pub output_schema: JsonSchema,
    pub requires: Vec<Capability>,     // ["net.fetch:{host}"]
    pub effect: EffectClass,           // 0 pure … 3 irreversible
    pub cost_hint: CostHint,
    pub timeout: Duration,
}
```

Built-in tools in 1.0:

| Tool | Effect | Capability | Purpose |
|---|---|---|---|
| `memory.search` | 0 | `mem.read` | Hybrid retrieval over Semantic memory |
| `memory.canon_lookup` | 0 | `mem.read` | Firm facts by subject |
| `vault.read` | 0 | `fs.read:{scope}` | Read a Vault file |
| `vault.write` | 2 | `fs.write:{scope}` | Create/update an artifact (versioned) |
| `web.fetch` | 1 | `net.fetch:{host}` | Fetch a URL, archived to Sources |
| `web.search` | 1 | `net.search` | Search provider |
| `artifact.diff` | 0 | `fs.read` | Structural diff between versions |
| `data.compute` | 0 | — | Sandboxed calculation over tabular input |
| `delegate` | 0 | `org.delegate` | Issue a Work Order (Executive and heads only) |
| `ask_principal` | 1 | `org.interrupt` | Raise an Approval Request or question |
| `record_decision` | 2 | `org.decide` | Write a Decision |
| `schedule` | 2 | `org.automate` | Create a Trigger |

Contract rules:
1. A tool call with an unsatisfied capability **never executes**; it returns `fenced` with the missing
   capability named, and the agent must escalate or work around it. Silent failure is prohibited.
2. Effect class ≥2 requires a persisted intent row before execution (crash-safe replay).
3. Effect class 3 always produces an Approval Request unless a standing `always` grant exists.
4. Tool outputs are schema-validated and truncated to a declared budget with an explicit truncation marker.

## 6. Agent output contracts

Every agent Turn must return JSON matching a purpose-specific schema. Example, the Deliverable contract:

```json
{
  "$id": "sidra://schema/deliverable/1",
  "type": "object",
  "required": ["summary", "assessment", "confidence"],
  "properties": {
    "summary":    { "type": "string", "maxLength": 1200 },
    "artifact":   { "type": "object", "properties": {
                      "path": {"type":"string"}, "kind": {"type":"string"} } },
    "assessment": { "type": "array", "items": { "type": "object",
                      "required": ["criterion_id","status"],
                      "properties": {
                        "criterion_id": {"type":"string"},
                        "status": {"enum": ["met","partial","unmet"]},
                        "evidence": {"type":"string"},
                        "reason":   {"type":"string"} } } },
    "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
    "gaps":       { "type": "array", "items": {"type":"string"} },
    "sources":    { "type": "array", "items": {"type":"string"} }
  },
  "additionalProperties": false
}
```

Validation failure is not an error path to hide: attempt 1 re-prompts with the validator's message,
attempt 2 falls back to a stricter/larger model, attempt 3 escalates. All three are logged.

## 7. Future HTTP API (3.0, designed now)

The kernel's command/query surface maps 1:1 onto HTTP so that the desktop app becomes one client among
several without a rewrite.

```
POST   /v1/engagements                 → directive.submit
GET    /v1/engagements?status=…        → engagement.list
GET    /v1/engagements/{id}            → engagement.get
POST   /v1/engagements/{id}/authorize  → mandate.authorize
POST   /v1/approvals/{id}/respond      → approval.respond
GET    /v1/search?q=…                  → search.everywhere
GET    /v1/stream                      → SSE of the event bus (with Last-Event-ID = seq)
```

Design commitments made now to keep that path open:
- No command depends on renderer-local state.
- Every command is idempotent given `request_id`.
- Every query is expressible with a cursor and a tenant filter (`workspace_id` is already reserved in the
  schema layer as a nullable column defaulting to the local Firm).
- Auth is a header concern only; the Permission Broker already takes a principal identity, which today is
  always the single local Principal.
