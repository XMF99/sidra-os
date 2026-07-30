# THEKY Engineering Architecture: Data Architecture

**Document ID:** `E01-06`  
**Status:** `IMPLEMENTATION-GRADE`  
**Governing Authority:** `E00 Engineering Constitution`  
**Target Path:** `engineering/E01-engineering-architecture/06-data-architecture.md`  

---

## 1. Database Architecture Overview

THEKY adopts a **local-first, embedded database architecture** centered around SQLite 3.45+ operating in Write-Ahead Logging (WAL) mode.

```
+-----------------------------------------------------------------------------------+
|                            THEKY STORAGE VAULT (SQLite)                           |
+-----------------------------------------------------------------------------------+
|  Master Database Connection Pool (`rusqlite`)                                     |
|  Mode: WAL (Write-Ahead Logging), Synchronous: NORMAL, Page Size: 4096            |
|                                                                                   |
|  +---------------------------+ +------------------------+ +--------------------+  |
|  | Hash-Chained Event Store  | | Domain Projection DB   | | Vector Store       |  |
|  | (Source of Truth)         | | (Read-side SQL Tables) | | (sqlite-vec Index) |  |
|  +---------------------------+ +------------------------+ +--------------------+  |
|  +-----------------------------------------------------------------------------+  |
|  | Cryptographic Secret Vault (Argon2id + AES-256-GCM Encrypted Payloads)      |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Event Store Schema & Storage Invariants

The event store table stores every state change as an immutable record.

```sql
-- Core Hash-Chained Event Log Schema
CREATE TABLE system_event_log (
    sequence_number INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL UNIQUE,
    stream_id TEXT NOT NULL,
    department_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    timestamp_utc TEXT NOT NULL,
    previous_hash TEXT NOT NULL,
    current_hash TEXT NOT NULL,
    CHECK (length(event_id) = 36),
    CHECK (length(previous_hash) = 64),
    CHECK (length(current_hash) = 64)
);

-- Indices for rapid event stream lookup and projection processing
CREATE INDEX idx_events_sequence ON system_event_log(sequence_number);
CREATE INDEX idx_events_stream_seq ON system_event_log(stream_id, sequence_number);
CREATE INDEX idx_events_dept_seq ON system_event_log(department_id, sequence_number);
```

---

## 3. Security Vault & Zero-Knowledge Encryption

Sensitive fields (API tokens, user credentials, key material, PII) are encrypted before insertion into SQLite using **AES-256-GCM**.

```
[ Plaintext Secret ] 
        |
        v
[ Argon2id KDF Key Derivation ] + [ Master Password + Salt ]
        |
        v
[ AES-256-GCM Encryption ] + [ 96-bit Random IV ]
        |
        v
[ Encrypted Binary Blob ] ---> Stored in `vault_secrets` Table
```

### 3.1 Encrypted Secrets Schema
```sql
CREATE TABLE vault_secrets (
    secret_id TEXT PRIMARY KEY,
    department_id TEXT NOT NULL,
    secret_key_name TEXT NOT NULL UNIQUE,
    encrypted_payload BLOB NOT NULL,
    nonce BLOB NOT NULL,
    auth_tag BLOB NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

---

## 4. Vector Store Architecture (`sqlite-vec`)

Semantic search and RAG embeddings are integrated directly into SQLite using the `sqlite-vec` extension, eliminating external database dependencies.

```sql
-- Create 384-dimensional vector table for text embeddings (all-MiniLM-L6-v2)
CREATE VIRTUAL TABLE vector_embeddings USING vec0(
    embedding_id TEXT PRIMARY KEY,
    department_id TEXT,
    source_event_id TEXT,
    embedding float[384]
);

-- Nearest Neighbor Search Query Contract
-- SELECT embedding_id, distance 
-- FROM vector_embeddings 
-- WHERE embedding MATCH :query_vector AND k = 10;
```

---

## 5. Forward-Only Idempotent Migration Strategy

Database schema migrations follow strict stability guidelines:

1. **Forward-Only:** No down-migrations. Rollbacks are executed by deploying a forward patch migration.
2. **Idempotent:** Every migration script must execute cleanly regardless of how many times it is run (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE ADD COLUMN` with column existence checks).
3. **Migration Version Table:**
   ```sql
   CREATE TABLE IF NOT EXISTS schema_migrations (
       version INTEGER PRIMARY KEY,
       name TEXT NOT NULL,
       applied_at TEXT NOT NULL,
       checksum TEXT NOT NULL
   );
   ```

---
