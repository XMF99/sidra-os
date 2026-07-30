# THEKY Engineering Architecture: Backend Architecture

**Document ID:** `E01-04`  
**Status:** `IMPLEMENTATION-GRADE`  
**Governing Authority:** `E00 Engineering Constitution`  
**Target Path:** `engineering/E01-engineering-architecture/04-backend-architecture.md`  

---

## 1. Rust Service Architecture & Tokio Engine

The backend runtime of THEKY is powered by a multi-threaded native Rust process built on `tokio` and Tauri v2 core primitives.

```
+-----------------------------------------------------------------------------------+
|                            MAIN TAURI CORE PROCESS (Rust)                         |
+-----------------------------------------------------------------------------------+
|  Tokio Async Runtime (Multi-Thread Worker Pool)                                   |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                           COMMAND DISPATCHER BUS                            |  |
|  +-----------------------------------------------------------------------------+  |
|         |                                 |                             |         |
|         v                                 v                             v         |
|  +---------------------+        +---------------------+       +----------------+  |
|  |  Finance Service    |        | Operations Service  |       | AI Runtime     |  |
|  |  Command Handlers   |        | Command Handlers    |       | Executor       |  |
|  +---------------------+        +---------------------+       +----------------+  |
|         |                                 |                             |         |
|         +---------------------------------+-----------------------------+         |
|                                           |                                       |
|                                           v                                       |
|  +-----------------------------------------------------------------------------+  |
|  |                 HASH-CHAINED APPEND-ONLY EVENT STORE                        |  |
|  |                 (SHA-256 State Hashing & SQLite Persistence)                |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. CQRS Pattern & Application Services

Commands (state mutations) and Queries (state reads) follow complete segregation:

### 2.1 Command Handler Workflow
1. **Request Intake:** Receiver gets JSON payload via IPC Command handler.
2. **Capability Check:** Passes context (`department_id`, `requested_capability`, `caller_id`) to the **Permission Broker**.
3. **Domain Execution:** Instantiates domain aggregate root from pure Rust domain crate (`packages/domain`).
4. **Event Generation:** Domain logic validates state invariants and emits 1..N Domain Events.
5. **Event Store Commit:** The Event Store hashes and appends the new event(s) inside a single SQLite transaction.
6. **Projection Dispatch:** Background worker updates read-side query tables asynchronously.

### 2.2 Query Handler Workflow
- Queries read directly from indexed SQLite read-side projection tables.
- Zero event replaying is required during query execution, guaranteeing sub-millisecond query responses.

---

## 3. Hash-Chained Append-Only Event Store (ADR-0002)

The Event Store is the authoritative, immutable source of truth for the entire operating system.

### 3.1 Event Record Schema Definition

```sql
CREATE TABLE IF NOT EXISTS system_event_log (
    sequence_number INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL UNIQUE,
    stream_id TEXT NOT NULL,
    department_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    timestamp_utc TEXT NOT NULL,
    previous_hash TEXT NOT NULL,
    current_hash TEXT NOT NULL
);

CREATE INDEX idx_events_stream ON system_event_log(stream_id, sequence_number);
CREATE INDEX idx_events_dept ON system_event_log(department_id);
```

### 3.2 Cryptographic Hash Chaining Mechanism
For every new event $E_n$ appended at sequence $n$:
$$\text{CurrentHash}_n = \text{SHA256}(\text{Sequence}_n \parallel \text{EventID}_n \parallel \text{PreviousHash}_{n-1} \parallel \text{PayloadJSON}_n \parallel \text{Timestamp}_n)$$

If $\text{Sequence} = 1$ (Genesis event), $\text{PreviousHash}_0 = \text{"0"}^{64}$.

```rust
// Cryptographic Hash Chain Calculation (packages/vault/src/event_store.rs)
use sha2::{Digest, Sha256};

pub fn compute_event_hash(
    seq: u64,
    event_id: &str,
    prev_hash: &str,
    payload_json: &str,
    timestamp: &str,
) -> String {
    let mut hasher = Sha256::new();
    hasher.update(seq.to_be_bytes());
    hasher.update(event_id.as_bytes());
    hasher.update(prev_hash.as_bytes());
    hasher.update(payload_json.as_bytes());
    hasher.update(timestamp.as_bytes());
    format!("{:x}", hasher.finalize())
}
```

---

## 4. Repository Trait Abstractions

Domain logic accesses storage exclusively through trait interfaces defined in `packages/domain`:

```rust
// Pure Domain Trait Definition (packages/domain/src/repositories.rs)
#[async_trait::async_trait]
pub trait EventStoreRepository: Send + Sync {
    async fn append_event(&self, event: &DomainEvent) -> Result<u64, StorageError>;
    async fn fetch_stream(&self, stream_id: &str) -> Result<Vec<DomainEvent>, StorageError>;
    async fn verify_chain_integrity(&self) -> Result<bool, StorageError>;
}
```

Implementations reside in `packages/vault` using `rusqlite` connection pooling.

---
