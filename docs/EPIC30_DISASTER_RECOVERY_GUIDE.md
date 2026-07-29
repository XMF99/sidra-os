# Sidra OS — Disaster Recovery Guide (Epic 30)

## Disaster Recovery & State Remediation Manual

This guide outlines emergency procedures for database backups, state corruption recovery, event log replay, and projection rebuilding.

---

## 1. Vault Substrate Backup & Restore

The entire state of Sidra OS resides in a single SQLite database (`sidra_vault.db`).

### Automated Backup Procedure
```bash
# Create consistent SQLite snapshot
sqlite3 sidra_vault.db ".backup 'sidra_vault_backup_$(date +%Y%m%d_%H%M%S).db'"
```

### Cold Restore Procedure
1. Stop the kernel server / desktop host process.
2. Replace `sidra_vault.db` with the verified backup file.
3. Restart the kernel server. Embedded Refinery migrations (`V1__...sql` to `V38__...sql`) will run automatically if required.

---

## 2. Event Log SHA-256 Hash Chain Verification & Replay

### Verifying Chain Integrity
If corruption or unauthorized tampering is suspected:
```bash
# Run event log verification
cargo test --package sidra-store --test event_log_verification
```

### Rebuilding Projections from Event Stream
In the event of projection index corruption (FTS5 search index or memory cache):
```bash
# Rebuild all read models deterministically from sequence 0
sidra-cli admin rebuild-projections --from-seq 0
```
This iterates sequentially through all SHA-256 event log entries and reconstructs every projection table from scratch.
