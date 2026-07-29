# Sidra OS — Runtime Inventory (Epic 30)

## Inventory of the 17 Foundation Runtime Engines

Every runtime engine in Sidra OS is an isolated service module with well-defined state boundaries, security capabilities, and IPC interfaces.

---

### 1. Mission Runtime (`services/mission`)
- **Purpose**: Translates high-level Principal Directives into formal Mandates, Objectives, and execution plans.
- **Key Modules**: `planner`, `scheduler`, `risk`, `verify`, `recovery`, `state`.
- **State Storage**: SQLite Vault tables (`missions`, `mandates`, `objectives`).

### 2. Decision Engine (`services/decisions`)
- **Purpose**: Manages decision proposals, risk scoring, Principal approval requests, and structural vetoes.
- **Key Modules**: `evaluator`, `veto`, `authorship`, `escalation`.
- **State Storage**: SQLite Vault tables (`decisions`, `approvals`, `vetoes`).

### 3. Policy Engine (`services/security/src/fence.rs`)
- **Purpose**: Evaluates organizational rules, role boundaries, standards compliance, and scope constraints.
- **Key Modules**: `fence`, `rules`, `policy_evaluator`.
- **State Storage**: Vault policy definitions & JSON schema manifests.

### 4. Security Engine (`services/security`)
- **Purpose**: Implements the single PermissionBroker choke-point for EffectClasses 0–3, Keychain management, and ACL enforcement.
- **Key Modules**: `broker`, `fence`, `keychain`, `egress`, `audit`.
- **State Storage**: Encrypted OS Keychain & Vault permission tables.

### 5. Planning Engine (`services/mission/src/planner`)
- **Purpose**: Compiles high-level Objectives into DAGs of typed Work Orders for execution.
- **Key Modules**: `graph`, `work_order_compiler`, `dependency_resolver`.
- **State Storage**: Vault Work Order state & execution graphs.

### 6. Execution Coordination Engine (`services/orchestrator`)
- **Purpose**: Dispatches Work Orders to agent workers, monitors execution, handles timeouts, and collects task artifacts.
- **Key Modules**: `orchestrator`, `routing`, `dispatcher`.
- **State Storage**: Transient worker pools & Vault task state.

### 7. Resource Engine (`services/store/src/vault.rs`)
- **Purpose**: Provides atomic single-file SQLite database operations, schema migrations, and transactional isolation.
- **Key Modules**: `vault`, `migrations`, `transaction_manager`.
- **State Storage**: `sidra_vault.db` SQLite database.

### 8. Event Bus Engine (`services/store/src/event_log.rs`)
- **Purpose**: Maintains the append-only, SHA-256 hash-chained immutable event stream.
- **Key Modules**: `event_log`, `hash_chain`, `event_publisher`.
- **State Storage**: `event_log` table in SQLite Vault.

### 9. Observability Engine (`services/store/src/projections.rs`)
- **Purpose**: Drives telemetry-free system audit, rebuildable read projections, and performance metric tracking.
- **Key Modules**: `projections`, `audit_trail`, `metric_collector`.
- **State Storage**: In-memory & persisted projection tables.

### 10. Resilience Engine (`services/kernel`)
- **Purpose**: Manages process lifecycles, health monitoring, crash recovery, and state checkpointing.
- **Key Modules**: `lifecycle`, `recovery`, `checkpoint_manager`.
- **State Storage**: Vault snapshot state & disk checkpoints.

### 11. Autonomous Operations Engine (`services/evolution`)
- **Purpose**: Drives self-calibration, procedural compilation, charter evolution, and quarterly self-review.
- **Key Modules**: `calibration`, `compilation`, `charter_evolution`, `self_review`.
- **State Storage**: Evaluation matrices & proposed workflow candidates.

### 12. Workflow Runtime (`services/compilation`)
- **Purpose**: Compiles repeated multi-step task patterns into formal, reusable, executable Workflows.
- **Key Modules**: `procedural_compiler`, `workflow_validator`.
- **State Storage**: Compiled workflow definitions in Vault.

### 13. Automation Runtime (`services/orchestrator/src/orchestrator.rs`)
- **Purpose**: Manages background scheduled tasks, recurring maintenance jobs, and automated event triggers.
- **Key Modules**: `scheduler`, `task_runner`, `trigger_evaluator`.
- **State Storage**: Scheduled job registry.

### 14. Agent Runtime (`services/agents`)
- **Purpose**: Instantiates Executive, Specialist, and Worker agents based on role charters and tool grants.
- **Key Modules**: `charter`, `executive`, `specialist`, `worker`.
- **State Storage**: Agent memory & active context frames.

### 15. Knowledge Runtime (`services/memory`)
- **Purpose**: Provides hybrid Reciprocal Rank Fusion (RRF) search across vector embeddings and BM25 text indices.
- **Key Modules**: `hybrid_search`, `rrf_retriever`, `vector_store`.
- **State Storage**: SQLite FTS5 index & vector storage tables.

### 16. Connector Runtime (`services/connectors`)
- **Purpose**: Manages third-party system integrations, per-department OAuth credentials, and egress inspection.
- **Key Modules**: `connector_framework`, `grant_manager`, `egress_inspector`.
- **State Storage**: Encrypted credential custody in OS Keychain.

### 17. Developer Console (`apps/desktop/src/rooms`)
- **Purpose**: Interactive 16-module desktop visual dashboard for system monitoring, mission planning, and administration.
- **Key Modules**: `DashboardRoom`, `Mission`, `Decision`, `EventLogRoom`, `SystemHealthRoom`, `ArtifactsRoom`, `SeatsRoom`, `VoiceRoom`, `Console`.
- **State Storage**: Local React UI state + Tauri IPC bindings.
