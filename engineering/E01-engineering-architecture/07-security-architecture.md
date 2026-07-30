# THEKY Engineering Architecture: Security Architecture

**Document ID:** `E01-07`  
**Status:** `IMPLEMENTATION-GRADE`  
**Governing Authority:** `E00 Engineering Constitution`  
**Target Path:** `engineering/E01-engineering-architecture/07-security-architecture.md`  

---

## 1. Security Philosophy & Threat Model

THEKY operates under a zero-trust, default-deny security model. Ambient access rights do not exist. Every component—whether React UI view, Rust service, sub-agent worker, or Wasm connector—must present a valid capability token issued by the **Permission Broker** before executing effectful operations.

---

## 2. Permission Broker: The Single Choke Point (ADR-0006)

The Permission Broker (`packages/permission-broker`) is the centralized, non-bypassable choke point for all access decisions across the operating system.

```
Requesting Agent / Service / UI Component
                   |
                   | 1. Request Capability Grant (Action, Target, Resource, Dept)
                   v
   +---------------------------------------+
   |           PERMISSION BROKER           |
   |                                       |
   |  - Validates Capability Token         |
   |  - Evaluates Department Ceiling       |
   |  - Verifies Sub-Budget Remaining      |
   |  - Checks Capability Policy Matrix    |
   +---------------------------------------+
                   |
          +--------+--------+
          |                 |
 [ DENIED ]                 [ GRANTED ]
    |                          |
    v                          v
Return AccessDenied        Proceed to Domain
(Emit Security Audit)      Handler Execution
```

---

## 3. Capability Tokens & Evaluation Pipeline

Capabilities are represented as cryptographically signed, short-lived tokens in memory:

```rust
// Capability Definition (packages/permission-broker/src/capability.rs)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapabilityToken {
    pub token_id: String,
    pub department_id: String,
    pub action: SecurityAction,
    pub target_resource: String,
    pub valid_until_utc: String,
    pub signature: String, // HMAC-SHA256 signature using session key
}

pub enum SecurityAction {
    FileSystemRead,
    FileSystemWrite,
    NetworkConnect { host: String, port: u16 },
    VaultSecretDecrypt { secret_name: String },
    AgentExecuteTool { tool_name: String },
    DepartmentCrossCall { target_dept: String },
}
```

---

## 4. Department Ceilings & Boundary Isolation (ADR-0013)

Departments are hard security boundaries. A department cannot exceed its pre-configured capability ceiling regardless of agent requests.

### 4.1 Department Ceiling Rules
1. **Memory Isolation:** Every department context has an isolated state manager and query projection scope.
2. **Capability Ceiling:** Hard-coded max permissions (e.g., `Department: Finance` can access financial event streams, but cannot issue raw network requests to unauthorized external domains).
3. **Sub-Budget Ceiling:** Token, compute CPU cycles, and disk quota sub-ceilings are enforced per department.
4. **Exchange-Only Cross-Communication:** Departments cannot directly call internal routines of other departments. They communicate exclusively via standardized contract exchange events (`services/departments`).

---

## 5. Secrets Management & Memory Scrubbing

Secrets (API keys, master encryption keys) are protected at rest and in memory:

1. **OS Keychain Binding:** Master key salt is stored in native OS Keyring (Windows DPAPI, macOS Keychain, Linux SecretService).
2. **Zero-Knowledge Key Derivation:** Master Encryption Keys are derived via Argon2id:
   - Memory cost: 64 MB
   - Iterations: 3
   - Parallelism: 4
3. **Memory Zeroization:** Sensitive keys in Rust memory use the `secrecy` crate, ensuring memory pages are explicitly zeroed out when dropped (`ZeroizeOnDrop`).

---
