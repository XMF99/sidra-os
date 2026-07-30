# THEKY Engineering Architecture: Observability Architecture

**Document ID:** `E01-10`  
**Status:** `IMPLEMENTATION-GRADE`  
**Governing Authority:** `E00 Engineering Constitution`  
**Target Path:** `engineering/E01-engineering-architecture/10-observability-architecture.md`  

---

## 1. Unified Telemetry Framework

Observability in THEKY provides complete visibility into system execution while preserving privacy and local-first data ownership.

```
+-----------------------------------------------------------------------------------+
|                            TELEMETRY ENGINE (Rust Core)                           |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  +---------------------------+ +------------------------+ +--------------------+  |
|  | Structured Logging        | | Metrics Aggregator     | | Distributed Trace  |  |
|  | (`tracing` JSON Subscriber)| | (Counters, Histograms) | | (Trace & Span ID) |  |
|  +---------------------------+ +------------------------+ +--------------------+  |
|                                |                                                  |
|                                v                                                  |
|  +-----------------------------------------------------------------------------+  |
|  | AUTOMATED REDACTION FILTER (Regex & Vault Schema Scrubbing)                 |  |
|  +-----------------------------------------------------------------------------+  |
|                                |                                                  |
|                                v                                                  |
|  +-----------------------------------------------------------------------------+  |
|  | LOCAL LOG STORE (`<vault>/logs/app.jsonl` - Rotated, Max 50 MB)             |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Structured Logging & Redaction Standard

All logs are generated in structured JSON Lines (`.jsonl`) format using Rust's `tracing` crate.

### 2.1 JSON Log Entry Schema
```json
{
  "timestamp": "2026-07-30T05:50:58.123Z",
  "level": "INFO",
  "target": "services::departments::finance",
  "trace_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "span_id": "4a12b9c0",
  "department_id": "DEPT_FINANCE",
  "message": "Invoice command executed successfully",
  "fields": {
    "invoice_id": "INV-2026-001",
    "execution_time_ms": 14.2
  }
}
```

### 2.2 Automated Secret Redaction Policy
Log sinks pass all fields through an automated redaction filter before writing to disk:
- **Keys Matching:** `password`, `secret`, `token`, `key`, `auth`, `ssn`, `credit_card`.
- **Action:** Values matching sensitive key names or regex patterns are replaced with `"[REDACTED_SECRET]"`.

---

## 3. Audit Telemetry & Hash Verification

To guarantee that logs and audit trails are never tampered with:

1. **Event Log Audit Script:** The audit engine periodically re-computes state hashes from sequence 1 to $N$.
2. **Audit Diagnostic Endpoint:**
   ```rust
   pub async fn verify_system_audit_trail() -> AuditReport {
       let is_valid = event_store.verify_chain_integrity().await?;
       AuditReport {
           total_events: event_store.count().await?,
           chain_integrity_valid: is_valid,
           last_verified_sequence: event_store.latest_sequence().await?,
       }
   }
   ```

---
