# Architectural Extension Points

> **Governance Authority:** Program E05.5  
> **Status:** OFFICIAL & CERTIFIED  

---

## 1. Extension Point Architecture

To ensure zero breaking changes during future implementation programs (E06–E14), explicit extension points have been specified across frontend, SDK, domain, and security crates.

---

## 2. Extension Point Taxonomy

### 1. Frontend UI Extension Points (`@sidra/ui`, `@sidra/desktop`)
- `AIWorkspaceTabPlugin`: Allows dynamically registering sub-tabs in `AIWorkspacePage` without modifying existing routes.
- `CustomCardSlot`: Accepts arbitrary React nodes in `KPICard`, `Alert`, and `ChatBubble`.

### 2. IPC SDK Bridge Extension Points (`@sidra/sdk`)
- `executeIPCCommand<T>`: Generic payload executor allowing arbitrary new Rust command payloads while maintaining backward compatibility.

### 3. Security & Permission Extension Points (`packages/permission-broker`)
- `SecurityAction::Custom(String)`: Enum variant allowing domain modules to define custom action types without modifying core security traits.

### 4. Storage Vault Extension Points (`packages/vault`)
- `EventStore::append_custom_event`: Generic event schema payload supporting vector embeddings and telemetry logs.
