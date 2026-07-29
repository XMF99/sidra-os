# Sidra OS — Production Deployment Guide (Epic 30)

## Production Deployment & Packaging Guide

This guide details air-gapped offline-first deployment, packaging binary artifacts, initializing the SQLite Vault substrate, and production hardening.

---

## 1. Air-Gapped & Offline-First Execution

Sidra OS is engineered under **ADR-0009 (No Telemetry / Offline Execution Guarantee)**.

- **Zero Phone-Home**: The system makes zero telemetry calls or unprompted external HTTP requests.
- **On-Device LLM / Local Gateway**: Compatible with local Ollama, llama.cpp, or enterprise air-gapped gateways.
- **Local Speech-to-Text**: Voice Directives execute strictly on-device using local STT engines (`services/voice`).

---

## 2. Desktop & Server Packaging

### Packaging Desktop Binary (Tauri)
```bash
# Build production bundle for desktop
pnpm --filter @sidra/desktop tauri build
```
Generates signed platform installers:
- Windows: `.msi` / `.exe` setup
- macOS: `.dmg` / `.app` bundle
- Linux: `.AppImage` / `.deb` package

### Packaging Headless Kernel Server (M23)
```bash
# Build standalone kernel server binary
cargo build --release --bin sidra-kernel-server
```

---

## 3. Database Initialization & Security Hardening

1. **Database Path**: Point `SIDRA_VAULT_PATH` to local NVMe storage (`/var/lib/sidra/vault.db` or `%APPDATA%\SidraOS\vault.db`).
2. **Refinery Migrations**: On first boot, `services/store` automatically executes embedded migrations (`V1__...sql` to `V38__...sql`).
3. **Keychain Binding**: Ensure OS keychain service (Windows Credential Manager, macOS Keychain, Linux Secret Service) is running.
