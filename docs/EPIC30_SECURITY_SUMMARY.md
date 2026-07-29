# Sidra OS — Security Summary (Epic 30)

## Security Architecture & Threat Model

Sidra OS implements defense-in-depth across every architectural boundary.

---

## 1. Single Choke-Point Authorization (`PermissionBroker`)

All privileged operations route strictly through `services/security::PermissionBroker::authorize_action`.

### EffectClass Spectrum
- **EffectClass 0 (Read / Pure In-Memory)**: Free evaluation; zero persistent side effects.
- **EffectClass 1 (Local State Mutation)**: Requires valid agent charter grant and session authentication.
- **EffectClass 2 (External / Connector Egress)**: Requires explicit department connector grant and OAuth scope verification.
- **EffectClass 3 (Destructive / Structural Change)**: Requires explicit Principal approval request and decision record in the Vault.

---

## 2. Capability-Bounded Wasm Sandbox

- **Runtime**: `wasmi` WebAssembly interpreter (`wasm32-wasip1`).
- **Isolation**: Ambient authority is completely stripped (no direct file system, raw sockets, or process spawning).
- **Tool Grants**: Executable artifacts and plugins receive strictly declared capability sets matching their producing Work Order.

---

## 3. Credential Custody & Egress Inspection

- **Keychain Custody**: OAuth tokens and API secrets are encrypted using the OS Keychain (`services/security/src/keychain.rs`).
- **Egress Audit**: Connector network calls inspect destination URLs against department egress declarations (`services/security/src/egress.rs`).
