# Sidra OS — API Inventory (Epic 30)

## Exported API Catalog & Interface Register

Sidra OS exposes public interfaces across its Rust service crates, IPC layer, and auto-generated TypeScript bindings.

---

## 1. Core Rust Service APIs

### `sidra-domain` (`packages/domain`)
- **Key Structs**: `Directive`, `Mandate`, `Objective`, `WorkOrder`, `Event`, `Decision`, `Seat`, `Department`.
- **Thread Safety**: All domain types implement `Send + Sync + Clone + Serialize + Deserialize`.

### `sidra-store` (`services/store`)
- **`VaultRepository`**:
  - `pub fn open(path: &Path) -> Result<Self, StoreError>`
  - `pub fn execute_migration(&self) -> Result<u32, StoreError>`
  - `pub fn query<T: FromRow>(&self, sql: &str, params: &[&dyn ToSql]) -> Result<Vec<T>, StoreError>`
- **`EventLogRepository`**:
  - `pub fn append_event(&self, event: &Event) -> Result<HeaderHash, StoreError>`
  - `pub fn verify_hash_chain(&self) -> Result<bool, StoreError>`
  - `pub fn fetch_stream(&self, start_seq: u64) -> Result<Vec<Event>, StoreError>`

### `sidra-security` (`services/security`)
- **`PermissionBroker`**:
  - `pub fn authorize_action(&self, actor: &SeatId, action: &Action, effect: EffectClass) -> Result<AuthDecision, SecurityError>`
- **`FenceManager`**:
  - `pub fn verify_fence(&self, agent_id: &AgentId, operation: &Operation) -> Result<bool, FenceError>`
- **`KeychainManager`**:
  - `pub fn store_secret(&self, key: &str, secret: &[u8]) -> Result<(), KeychainError>`
  - `pub fn get_secret(&self, key: &str) -> Result<Vec<u8>, KeychainError>`

### `sidra-orchestrator` (`services/orchestrator`)
- **`Orchestrator`**:
  - `pub fn dispatch_work_order(&self, work_order: WorkOrder) -> Result<TaskHandle, OrchestratorError>`
  - `pub fn cancel_task(&self, task_id: &TaskId) -> Result<(), OrchestratorError>`

### `sidra-models` (`services/models`)
- **`ModelRouter`**:
  - `pub fn route_call(&self, request: ModelRequest) -> Result<ModelResponse, RouterError>`

---

## 2. TypeScript Bindings (`packages/bindings`)

Auto-generated from Rust structs via `ts-rs` macros:

- `Directive`: Represents user directives issued via Voice or Console.
- `Mandate`: Formal authorized execution specification.
- `WorkOrder`: Sandboxed task unit dispatched to agents.
- `Event`: Append-only event payload structure.
- `Decision`: Approval request payload.
- `SystemHealth`: Operational health metrics structure.
