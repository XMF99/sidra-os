# Database Design

One SQLite file (`sidra.db`), encrypted with SQLCipher, with `sqlite-vec` for vectors and FTS5 for lexical
search. Everything the Firm knows lives here.

## 1. Design rules

1. **ULIDs as primary keys** — sortable by creation time, generated client-side, safe for future
   distributed use. Stored as `TEXT`.
2. **`events` is the source of truth.** Entity tables are projections; any of them could be rebuilt.
3. **No hard deletes** for records with history. `deleted_at` tombstones; purge is an explicit, audited act.
4. **Timestamps** are `INTEGER` epoch milliseconds, UTC. Local time is a presentation concern only.
5. **JSON columns** are used where the shape is genuinely open (payloads, params). They are always
   schema-validated in Rust before insert, so they are structured-but-flexible, not a dumping ground.
6. **Every table that can grow unboundedly has a covering index for its hot query and a retention policy.**
7. **Foreign keys are ON**, with `ON DELETE RESTRICT` for anything referenced by audit.

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
```

## 2. Core work tables

```sql
CREATE TABLE directives (
  id            TEXT PRIMARY KEY,
  body          TEXT NOT NULL,
  source        TEXT NOT NULL CHECK (source IN ('principal','automation','agent','brief_action')),
  addressed_to  TEXT REFERENCES agents(id),          -- non-null = direct address, bypasses Kai
  created_at    INTEGER NOT NULL,
  engagement_id TEXT REFERENCES engagements(id)
);

CREATE TABLE engagements (
  id             TEXT PRIMARY KEY,
  directive_id   TEXT NOT NULL REFERENCES directives(id),
  title          TEXT NOT NULL,
  status         TEXT NOT NULL CHECK (status IN
                   ('draft','clarifying','planning','executing','awaiting_approval',
                    'synthesizing','delivered','failed','abandoned')),
  priority       TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent','normal','background')),
  complexity     TEXT CHECK (complexity IN ('trivial','standard','deep','program')),
  budget_cents   INTEGER NOT NULL DEFAULT 0,          -- ceiling for this engagement
  spent_cents    INTEGER NOT NULL DEFAULT 0,
  deadline_at    INTEGER,
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL,
  closed_at      INTEGER,
  version        INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX idx_eng_status_updated ON engagements(status, updated_at DESC);

CREATE TABLE mandates (
  id              TEXT PRIMARY KEY,
  engagement_id   TEXT NOT NULL UNIQUE REFERENCES engagements(id),
  objective       TEXT NOT NULL,
  constraints     TEXT NOT NULL,        -- JSON array of strings
  success_criteria TEXT NOT NULL,       -- JSON array of {id, text, measurable}
  assumptions     TEXT NOT NULL,        -- JSON array of {text, confidence}
  staffing        TEXT NOT NULL,        -- JSON array of {agent_id, role, rationale}
  out_of_scope    TEXT,                 -- JSON array
  authorized_at   INTEGER,
  authorized_by   TEXT CHECK (authorized_by IN ('principal','standing_authority')),
  created_at      INTEGER NOT NULL
);

CREATE TABLE work_orders (
  id               TEXT PRIMARY KEY,
  engagement_id    TEXT NOT NULL REFERENCES engagements(id),
  parent_id        TEXT REFERENCES work_orders(id),
  issued_by        TEXT NOT NULL REFERENCES agents(id),
  assigned_to      TEXT NOT NULL REFERENCES agents(id),
  title            TEXT NOT NULL,
  instruction      TEXT NOT NULL,
  inputs           TEXT NOT NULL,       -- JSON: refs to artifacts, chunks, prior deliverables
  acceptance       TEXT NOT NULL,       -- JSON array of criteria, each independently checkable
  capability_grant TEXT NOT NULL,       -- JSON array of capability strings for this order only
  budget_cents     INTEGER NOT NULL,
  spent_cents      INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL CHECK (status IN
                     ('queued','running','in_review','rework','awaiting_approval',
                      'escalated','accepted','cancelled','failed')),
  attempt          INTEGER NOT NULL DEFAULT 0,
  rework_count     INTEGER NOT NULL DEFAULT 0,
  priority         INTEGER NOT NULL DEFAULT 100,
  deadline_at      INTEGER,
  created_at       INTEGER NOT NULL,
  started_at       INTEGER,
  completed_at     INTEGER
);
CREATE INDEX idx_wo_ready ON work_orders(status, priority, deadline_at);
CREATE INDEX idx_wo_engagement ON work_orders(engagement_id, created_at);

CREATE TABLE work_order_deps (
  work_order_id TEXT NOT NULL REFERENCES work_orders(id),
  depends_on    TEXT NOT NULL REFERENCES work_orders(id),
  kind          TEXT NOT NULL CHECK (kind IN ('finish_to_start','section_ready')),
  PRIMARY KEY (work_order_id, depends_on)
);

CREATE TABLE deliverables (
  id             TEXT PRIMARY KEY,
  work_order_id  TEXT NOT NULL REFERENCES work_orders(id),
  artifact_id    TEXT REFERENCES artifacts(id),
  summary        TEXT NOT NULL,
  self_assessment TEXT NOT NULL,        -- JSON: per-criterion met/partial/unmet + reason
  confidence     REAL NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  gaps           TEXT,                  -- JSON array: what it could not do and why
  created_at     INTEGER NOT NULL
);

CREATE TABLE reviews (
  id             TEXT PRIMARY KEY,
  deliverable_id TEXT NOT NULL REFERENCES deliverables(id),
  reviewer_id    TEXT NOT NULL REFERENCES agents(id),
  verdict        TEXT NOT NULL CHECK (verdict IN ('pass','pass_with_notes','block')),
  findings       TEXT NOT NULL,         -- JSON array {severity, location, issue, suggested_fix}
  created_at     INTEGER NOT NULL,
  CHECK (reviewer_id <> (SELECT assigned_to FROM work_orders w
                         JOIN deliverables d ON d.work_order_id = w.id
                         WHERE d.id = deliverable_id))
);

CREATE TABLE briefs (
  id            TEXT PRIMARY KEY,
  engagement_id TEXT REFERENCES engagements(id),
  kind          TEXT NOT NULL CHECK (kind IN ('engagement','morning','digest','incident')),
  situation     TEXT NOT NULL,
  actions       TEXT NOT NULL,          -- JSON array
  findings      TEXT NOT NULL,          -- JSON array
  recommendation TEXT NOT NULL,
  the_ask       TEXT,                   -- exactly one, nullable if none needed
  confidence    TEXT NOT NULL,          -- JSON: {overall, per_claim[]}
  cost_cents    INTEGER NOT NULL,
  read_at       INTEGER,
  created_at    INTEGER NOT NULL
);
```

## 3. Agents and organization

```sql
CREATE TABLE agents (
  id            TEXT PRIMARY KEY,       -- 'agent.exec', 'agent.cto', …
  name          TEXT NOT NULL,          -- 'Kai'
  title         TEXT NOT NULL,          -- 'Executive'
  department_id TEXT REFERENCES departments(id),
  reports_to    TEXT REFERENCES agents(id),
  active        INTEGER NOT NULL DEFAULT 1,
  current_version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE agent_versions (
  agent_id      TEXT NOT NULL REFERENCES agents(id),
  version       INTEGER NOT NULL,
  charter       TEXT NOT NULL,          -- JSON: purpose, responsibilities, refusals
  personality   TEXT NOT NULL,          -- JSON: voice, biases, register
  tools         TEXT NOT NULL,          -- JSON array of tool names
  capabilities  TEXT NOT NULL,          -- JSON array of capability strings (the standing fence)
  decision_bounds TEXT NOT NULL,        -- JSON: {can_decide[], must_escalate[], never[]}
  kpis          TEXT NOT NULL,          -- JSON array {id, name, target, window}
  routing_hint  TEXT NOT NULL,          -- default model class per purpose
  created_at    INTEGER NOT NULL,
  PRIMARY KEY (agent_id, version)
);

CREATE TABLE departments (
  id       TEXT PRIMARY KEY,
  name     TEXT NOT NULL,
  head_id  TEXT REFERENCES agents(id),
  charter  TEXT NOT NULL
);

CREATE TABLE agent_kpi_samples (
  agent_id   TEXT NOT NULL REFERENCES agents(id),
  kpi_id     TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  value      REAL NOT NULL,
  PRIMARY KEY (agent_id, kpi_id, window_start)
);
```

## 4. Execution, cost, and audit

```sql
CREATE TABLE turns (
  id              TEXT PRIMARY KEY,
  work_order_id   TEXT REFERENCES work_orders(id),
  meeting_id      TEXT REFERENCES meetings(id),
  agent_id        TEXT NOT NULL REFERENCES agents(id),
  agent_version   INTEGER NOT NULL,
  purpose         TEXT NOT NULL,        -- classify|plan|draft|review|synthesize|answer|extract
  model_class     TEXT NOT NULL,
  model_id        TEXT NOT NULL,        -- concrete model actually used
  idempotency_key TEXT NOT NULL UNIQUE,
  frame_digest    TEXT NOT NULL,        -- hash of the assembled context
  prompt_tokens   INTEGER NOT NULL DEFAULT 0,
  output_tokens   INTEGER NOT NULL DEFAULT 0,
  cached_tokens   INTEGER NOT NULL DEFAULT 0,
  cost_cents      INTEGER NOT NULL DEFAULT 0,
  latency_ms      INTEGER,
  status          TEXT NOT NULL CHECK (status IN ('running','committed','failed','cancelled')),
  error_code      TEXT,
  started_at      INTEGER NOT NULL,
  ended_at        INTEGER
);
CREATE INDEX idx_turns_cost ON turns(started_at DESC, agent_id);

CREATE TABLE turn_context_items (   -- exactly what the agent saw; powers the Inspector
  turn_id     TEXT NOT NULL REFERENCES turns(id),
  block       TEXT NOT NULL,        -- identity|situation|canon|retrieved|episodic|procedural
  source_type TEXT NOT NULL,        -- chunk|canon|event|artifact|playbook|mandate
  source_id   TEXT NOT NULL,
  tokens      INTEGER NOT NULL,
  rank        INTEGER,
  score       REAL,
  PRIMARY KEY (turn_id, block, source_type, source_id)
);

CREATE TABLE tool_calls (
  id           TEXT PRIMARY KEY,
  turn_id      TEXT NOT NULL REFERENCES turns(id),
  tool         TEXT NOT NULL,
  params       TEXT NOT NULL,       -- JSON, secrets redacted at write time
  effect_class INTEGER NOT NULL CHECK (effect_class IN (0,1,2,3)),  -- see security doc §5
  decision     TEXT NOT NULL CHECK (decision IN ('allowed','denied','approved','auto_approved')),
  result_digest TEXT,
  error        TEXT,
  duration_ms  INTEGER,
  created_at   INTEGER NOT NULL
);

CREATE TABLE events (
  seq          INTEGER PRIMARY KEY AUTOINCREMENT,
  id           TEXT NOT NULL UNIQUE,
  ts           INTEGER NOT NULL,
  actor        TEXT NOT NULL,        -- agent id | 'principal' | 'system'
  kind         TEXT NOT NULL,
  engagement_id TEXT,
  subject_type TEXT NOT NULL,
  subject_id   TEXT NOT NULL,
  payload      TEXT NOT NULL,        -- JSON
  prev_hash    TEXT NOT NULL,
  hash         TEXT NOT NULL         -- sha256(prev_hash || canonical(row))
);
CREATE INDEX idx_events_engagement ON events(engagement_id, seq);
CREATE INDEX idx_events_kind ON events(kind, seq DESC);

CREATE TABLE budget_ledger (
  id         TEXT PRIMARY KEY,
  period     TEXT NOT NULL,          -- '2026-07'
  scope      TEXT NOT NULL,          -- 'firm' | agent id | engagement id
  cents      INTEGER NOT NULL,
  ceiling_cents INTEGER,
  updated_at INTEGER NOT NULL,
  UNIQUE (period, scope)
);
```

## 5. Governance

```sql
CREATE TABLE decisions (
  id             TEXT PRIMARY KEY,
  engagement_id  TEXT REFERENCES engagements(id),
  meeting_id     TEXT REFERENCES meetings(id),
  title          TEXT NOT NULL,
  question       TEXT NOT NULL,
  options        TEXT NOT NULL,       -- JSON array {id, label, pros, cons, evidence_refs}
  criteria       TEXT NOT NULL,       -- JSON array {name, weight} — recorded BEFORE conclusions
  chosen_option  TEXT NOT NULL,
  rationale      TEXT NOT NULL,
  decided_by     TEXT NOT NULL,       -- agent id or 'principal'
  authority      TEXT NOT NULL CHECK (authority IN ('delegated','escalated','principal')),
  reversibility  INTEGER NOT NULL CHECK (reversibility IN (1,2,3)),  -- 1 trivial, 3 one-way door
  confidence     REAL NOT NULL,
  review_at      INTEGER,
  supersedes     TEXT REFERENCES decisions(id),
  superseded_by  TEXT REFERENCES decisions(id),
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','superseded','revoked')),
  created_at     INTEGER NOT NULL
);

CREATE TABLE dissents (
  id          TEXT PRIMARY KEY,
  decision_id TEXT NOT NULL REFERENCES decisions(id),
  agent_id    TEXT NOT NULL REFERENCES agents(id),
  position    TEXT NOT NULL,          -- recorded verbatim, never summarized away
  created_at  INTEGER NOT NULL
);

CREATE TABLE meetings (
  id            TEXT PRIMARY KEY,
  engagement_id TEXT REFERENCES engagements(id),
  kind          TEXT NOT NULL CHECK (kind IN
                  ('standup','design_review','decision_forum','post_mortem',
                   'retrospective','planning','incident')),
  chair_id      TEXT NOT NULL REFERENCES agents(id),
  agenda        TEXT NOT NULL,        -- JSON array of items
  max_rounds    INTEGER NOT NULL DEFAULT 3,
  budget_cents  INTEGER NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('scheduled','running','closed','aborted')),
  started_at    INTEGER, ended_at INTEGER
);

CREATE TABLE meeting_turns (
  id         TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL REFERENCES meetings(id),
  round      INTEGER NOT NULL,
  agent_id   TEXT NOT NULL REFERENCES agents(id),
  stance     TEXT CHECK (stance IN ('for','against','abstain','na')),
  content    TEXT NOT NULL,
  evidence   TEXT,                    -- JSON refs
  created_at INTEGER NOT NULL
);

CREATE TABLE minutes (
  id          TEXT PRIMARY KEY,
  meeting_id  TEXT NOT NULL UNIQUE REFERENCES meetings(id),
  attendees   TEXT NOT NULL,
  summary     TEXT NOT NULL,
  outcomes    TEXT NOT NULL,          -- JSON: decisions[], work_orders[], follow_ups[]
  markdown_path TEXT NOT NULL,        -- mirror in Vault/Records/minutes
  created_at  INTEGER NOT NULL
);

CREATE TABLE approval_requests (
  id           TEXT PRIMARY KEY,
  engagement_id TEXT REFERENCES engagements(id),
  work_order_id TEXT REFERENCES work_orders(id),
  requested_by TEXT NOT NULL REFERENCES agents(id),
  kind         TEXT NOT NULL,         -- capability|spend|irreversible|reconciliation
  ask          TEXT NOT NULL,         -- one plain sentence
  detail       TEXT NOT NULL,         -- JSON
  status       TEXT NOT NULL CHECK (status IN ('pending','granted','denied','expired')),
  grant_scope  TEXT CHECK (grant_scope IN ('once','session','always')),
  responded_at INTEGER,
  expires_at   INTEGER,
  created_at   INTEGER NOT NULL
);
```

## 6. Memory

```sql
CREATE TABLE documents (
  id          TEXT PRIMARY KEY,
  path        TEXT NOT NULL,          -- relative to Vault
  origin      TEXT NOT NULL,          -- upload|url|artifact|principal_note
  mime        TEXT NOT NULL,
  title       TEXT,
  hash        TEXT NOT NULL,          -- content hash, dedupe
  bytes       INTEGER NOT NULL,
  ingested_at INTEGER,
  status      TEXT NOT NULL CHECK (status IN ('pending','extracting','indexed','failed','tombstoned')),
  error       TEXT,
  UNIQUE (hash)
);

CREATE TABLE chunks (
  id          TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id),
  ordinal     INTEGER NOT NULL,
  heading_path TEXT,                  -- 'Contract > 4. Termination'
  locator     TEXT,                   -- 'p.42' | 'L120-160' | 'Sheet1!A1:D30'
  text        TEXT NOT NULL,
  tokens      INTEGER NOT NULL,
  created_at  INTEGER NOT NULL,
  deleted_at  INTEGER
);
CREATE INDEX idx_chunks_doc ON chunks(document_id, ordinal);

CREATE VIRTUAL TABLE chunks_fts USING fts5(
  text, heading_path, content='chunks', content_rowid='rowid', tokenize='porter unicode61'
);

CREATE VIRTUAL TABLE chunk_vectors USING vec0(
  chunk_id TEXT PRIMARY KEY, embedding FLOAT[1024]
);

CREATE TABLE canon (
  id           TEXT PRIMARY KEY,
  subject      TEXT NOT NULL,         -- 'pricing.model'
  statement    TEXT NOT NULL,
  scope        TEXT NOT NULL DEFAULT 'firm',
  confidence   REAL NOT NULL,
  source_type  TEXT NOT NULL,         -- principal|document|decision|inference
  source_ref   TEXT,
  valid_from   INTEGER NOT NULL,
  valid_to     INTEGER,               -- null = current
  supersedes   TEXT REFERENCES canon(id),
  status       TEXT NOT NULL CHECK (status IN ('active','contested','retired')),
  created_at   INTEGER NOT NULL
);
CREATE INDEX idx_canon_subject ON canon(subject, status, valid_from DESC);

CREATE TABLE reconciliations (
  id          TEXT PRIMARY KEY,
  canon_a     TEXT NOT NULL REFERENCES canon(id),
  canon_b     TEXT NOT NULL REFERENCES canon(id),
  detected_by TEXT NOT NULL,
  resolution  TEXT CHECK (resolution IN ('keep_a','keep_b','both_scoped','both_wrong')),
  resolved_by TEXT,
  resolved_at INTEGER,
  created_at  INTEGER NOT NULL
);

CREATE TABLE playbooks (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  trigger_desc TEXT NOT NULL,
  steps       TEXT NOT NULL,          -- JSON: ordered steps with agent + acceptance
  derived_from TEXT,                  -- JSON array of engagement ids
  uses        INTEGER NOT NULL DEFAULT 0,
  success_rate REAL,
  status      TEXT NOT NULL CHECK (status IN ('proposed','active','retired')),
  created_at  INTEGER NOT NULL
);
```

## 7. Artifacts, workflow, automation, UI

```sql
CREATE TABLE artifacts (
  id            TEXT PRIMARY KEY,
  engagement_id TEXT REFERENCES engagements(id),
  path          TEXT NOT NULL,
  kind          TEXT NOT NULL,        -- document|spec|dataset|image|code|deck
  title         TEXT NOT NULL,
  version       INTEGER NOT NULL DEFAULT 1,
  supersedes    TEXT REFERENCES artifacts(id),
  author_id     TEXT REFERENCES agents(id),   -- null when the Principal edited it
  edited_by_principal INTEGER NOT NULL DEFAULT 0,
  hash          TEXT NOT NULL,
  bytes         INTEGER NOT NULL,
  created_at    INTEGER NOT NULL,
  UNIQUE (path, version)
);

CREATE TABLE workflows (
  id            TEXT PRIMARY KEY,
  engagement_id TEXT REFERENCES engagements(id),
  template      TEXT,
  status        TEXT NOT NULL,
  definition    TEXT NOT NULL,        -- JSON DAG, frozen at compile time
  created_at    INTEGER NOT NULL
);

CREATE TABLE workflow_steps (
  id            TEXT PRIMARY KEY,
  workflow_id   TEXT NOT NULL REFERENCES workflows(id),
  node_key      TEXT NOT NULL,
  kind          TEXT NOT NULL,        -- work_order|meeting|gate|fanout|join|compensate
  ref_id        TEXT,
  status        TEXT NOT NULL,
  attempt       INTEGER NOT NULL DEFAULT 0,
  output_digest TEXT,
  started_at    INTEGER, ended_at INTEGER,
  UNIQUE (workflow_id, node_key)
);

CREATE TABLE triggers (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('schedule','event','file_watch','threshold','manual')),
  spec        TEXT NOT NULL,          -- cron+tz | event filter | glob | metric predicate
  action      TEXT NOT NULL,          -- JSON: directive template or workflow template + params
  fence       TEXT NOT NULL,          -- JSON capability set + spend ceiling
  enabled     INTEGER NOT NULL DEFAULT 1,
  last_run_at INTEGER, next_run_at INTEGER,
  consecutive_low_value INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL
);
CREATE INDEX idx_triggers_next ON triggers(enabled, next_run_at);

CREATE TABLE trigger_runs (
  id         TEXT PRIMARY KEY,
  trigger_id TEXT NOT NULL REFERENCES triggers(id),
  engagement_id TEXT REFERENCES engagements(id),
  outcome    TEXT NOT NULL,           -- ok|skipped|failed|fenced
  cost_cents INTEGER NOT NULL DEFAULT 0,
  value_rating INTEGER,               -- set by Principal or inferred from read/act
  created_at INTEGER NOT NULL
);

CREATE TABLE notifications (
  id         TEXT PRIMARY KEY,
  kind       TEXT NOT NULL,
  urgency    TEXT NOT NULL CHECK (urgency IN ('interrupt','surface','batch','silent')),
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  action     TEXT,                    -- JSON: command to run on click
  subject_type TEXT, subject_id TEXT,
  delivered_at INTEGER, read_at INTEGER, dismissed_at INTEGER,
  created_at INTEGER NOT NULL
);

CREATE TABLE preferences (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,           -- JSON
  updated_at INTEGER NOT NULL
);

CREATE TABLE ui_state (               -- panel sizes, last room, column widths, per-room
  scope      TEXT PRIMARY KEY,
  state      TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE plugins (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  version     TEXT NOT NULL,
  manifest    TEXT NOT NULL,
  capabilities TEXT NOT NULL,
  signature   TEXT,
  enabled     INTEGER NOT NULL DEFAULT 0,
  installed_at INTEGER NOT NULL
);
```

## 8. Key queries

| Query | Shape | Index used |
|---|---|---|
| Ready steps for the scheduler | `SELECT … FROM work_orders WHERE status='queued' AND NOT EXISTS (unsatisfied dep) ORDER BY priority, deadline_at` | `idx_wo_ready` |
| Engagement timeline | `SELECT … FROM events WHERE engagement_id=? ORDER BY seq` | `idx_events_engagement` |
| Hybrid retrieval | FTS5 BM25 top-50 ∪ `vec_distance` top-50 → RRF fuse in Rust → recency boost | `chunks_fts`, `chunk_vectors` |
| Month-to-date spend | `SELECT scope, cents FROM budget_ledger WHERE period=?` | PK |
| Decision chain | Recursive CTE over `supersedes` | PK |
| Inspector provenance | `turn_context_items` joined to source tables | PK |

## 9. Retention and growth

| Table | Growth driver | Policy |
|---|---|---|
| `events` | ~200/Engagement | Keep 24 months hot; older compacted into daily digests, originals archived to `.snapshots`; audit chain preserves the hash of compacted ranges |
| `turns`, `turn_context_items` | per model call | Context items pruned after 180 days; turn rows kept for cost history |
| `chunks`, `chunk_vectors` | per ingested page | Tombstoned on document deletion; vacuum monthly by the Night Shift |
| `meeting_turns` | per deliberation | Kept; Minutes are the summary, transcripts are the evidence |
| `notifications` | per day | Purged after 90 days |

Projected year-one: ~120 k events, ~300 k chunks, ~1.2 GB DB. Well inside SQLite's operating range;
`sqlite-vec` brute-force search over 300 k × 1024-dim vectors runs in ~30 ms, within the 200 ms search budget.

## 10. Migration policy

Forward-only numbered SQL files, each in one transaction. Rules: additive changes preferred; a column is
never repurposed; destructive changes require a data-migration step plus a pre-migration snapshot; every
migration ships with a test that runs it against a fixture Vault from the previous release.
