# Architecture Decision Records

An ADR records a decision that was expensive to make and would be expensive to reverse. It captures the
context at the time, the options considered, the choice, and the consequences we accepted — including the bad
ones. ADRs are immutable once accepted: a decision that changes gets a new ADR that supersedes the old one,
and the old one stays, because the reasoning that was wrong is as instructive as the reasoning that was right.

**Format:** Context → Options → Decision → Consequences → Status. One page. If it needs more than one page,
the decision is not yet understood.

**When one is required:** any change to the event log or memory schema; any new message kind; any change to
the capability model, effect classes, or Fences; any new external dependency in the kernel; any change to a
performance budget; and anything reordering the roadmap's dependencies.

| ADR | Title | Status |
|---|---|---|
| [0001](0001-tauri-over-electron.md) | Tauri 2 over Electron | Accepted |
| [0002](0002-event-log-as-source-of-truth.md) | Hash-chained event log as the source of truth | Accepted |
| [0003](0003-sqlite-single-file-vault.md) | SQLite + SQLCipher in a single-file Vault | Accepted |
| [0004](0004-executive-holds-five-tools.md) | The Executive holds only five tools | Accepted |
| [0005](0005-model-class-routing.md) | Route by Model Class, not by vendor | Accepted |
| [0006](0006-wasm-component-plugins.md) | WASM Component Model for plugins | Accepted |
| [0007](0007-hybrid-retrieval-rrf.md) | Hybrid retrieval with reciprocal-rank fusion | Accepted |
| [0008](0008-separation-of-author-and-reviewer.md) | The author of a Deliverable never reviews it | Accepted |
| [0009](0009-no-telemetry.md) | No telemetry, ever | Accepted |
| [0010](0010-typed-work-orders-over-freeform.md) | Typed Work Orders over free-form delegation | Accepted |
| [0011](0011-seven-directory-monorepo.md) | Seven-directory monorepo layout | Accepted |
