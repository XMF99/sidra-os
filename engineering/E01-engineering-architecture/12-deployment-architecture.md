# THEKY Engineering Architecture: Deployment Architecture

**Document ID:** `E01-12`  
**Status:** `IMPLEMENTATION-GRADE`  
**Governing Authority:** `E00 Engineering Constitution`  
**Target Path:** `engineering/E01-engineering-architecture/12-deployment-architecture.md`  

---

## 1. Desktop Packaging & Cross-Platform Bundling

THEKY is packaged as a standalone desktop binary using the native Tauri v2 bundler toolchain.

```
                                  TAURI BUNDLER TOOLCHAIN
                                             |
    +----------------------------------------+----------------------------------------+
    |                                        |                                        |
    v                                        v                                        v
[ WINDOWS BUNDLE ]                       [ MACOS BUNDLE ]                        [ LINUX BUNDLE ]
- Target: `x86_64-pc-windows-msvc`       - Target: `universal-apple-darwin`      - Target: `x86_64-unknown-linux-gnu`
- Formats: `.msi`, `.exe` (NSIS)         - Formats: `.dmg`, `.app`               - Formats: `.AppImage`, `.deb`
- Signing: Authenticode (EV Cert)        - Signing: Apple Developer ID + Notary  - Signing: GPG Detached Signature
```

---

## 2. Secure Auto-Updater Architecture

Updates are delivered via Tauri's cryptographic updater protocol:

```
[ THEKY Desktop Client ] ------------ 1. Poll Update Manifest ------------> [ Secure Release Server ]
          ^                                                                             |
          | <------------------------- 2. Signed Manifest (Ed25519) ------------------+
          |
  3. Validate Ed25519 Signature Against Embedded Public Key
          |
          v
  4. Download Delta Update Payload (`.tar.gz` / `.msi`)
          |
          v
  5. Verify SHA-256 Checksum
          |
          v
  6. Stage Atomic Swap on Next Restart
```

### 2.1 Update Verification Invariants
- **Public Key Embedding:** The release Ed25519 public key is hard-coded into the Tauri host binary during compilation.
- **No Unsigned Code:** Manifests or binary payloads lacking a valid signature are immediately discarded.

---

## 3. Rollback & Fault Recovery Policy

1. **Atomic Installer Swap:** Updates are downloaded to a staging folder (`<vault>/staging/`). The binary swap occurs atomically during startup.
2. **Boot Health Verification:** Upon launching a newly updated version, the application runs a self-diagnostic check within the first **5 seconds**:
   - Verify SQLite database connection and event store hash integrity.
   - Verify IPC bridge command handling.
3. **Automatic Rollback:** If the diagnostic check panics or fails, the application automatically terminates, restores the previous binary backup from `<vault>/backup/`, and launches the previous stable version.

---
