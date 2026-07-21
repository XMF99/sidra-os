use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use ts_rs::TS;

/// Strongly typed newtype identifier for an Engagement
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct EngagementId(pub String);

/// Operational status of the Sidra OS application
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub enum AppStatus {
    Initializing,
    Ready,
    Degraded,
    Error,
}

/// Brief status state
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub enum BriefStatus {
    Draft,
    Review,
    Ready,
    Archived,
}

/// System information structure passed over IPC to renderer
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct SystemInfo {
    pub version: String,
    pub platform: String,
    pub status: AppStatus,
}

/// Genesis hash for sequence 1 event
pub const GENESIS_HASH: &str = "0000000000000000000000000000000000000000000000000000000000000000";

/// Input payload for appending a new event to the event log
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EventInput {
    pub event_id: String,
    pub event_type: String,
    pub aggregate_type: String,
    pub aggregate_id: String,
    pub payload: String,
    pub metadata: String,
    pub timestamp: String,
}

/// Single immutable record in the append-only SHA-256 hash-chained event log
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct Event {
    pub sequence: i64,
    pub event_id: String,
    pub event_type: String,
    pub aggregate_type: String,
    pub aggregate_id: String,
    pub payload: String,
    pub metadata: String,
    pub timestamp: String,
    pub prev_hash: String,
    pub hash: String,
}

impl Event {
    /// Compute cryptographic SHA-256 hash chaining previous hash and event contents
    pub fn compute_hash(
        prev_hash: &str,
        sequence: i64,
        event_id: &str,
        event_type: &str,
        aggregate_type: &str,
        aggregate_id: &str,
        payload: &str,
        timestamp: &str,
    ) -> String {
        let mut hasher = Sha256::new();
        hasher.update(prev_hash.as_bytes());
        hasher.update(sequence.to_string().as_bytes());
        hasher.update(event_id.as_bytes());
        hasher.update(event_type.as_bytes());
        hasher.update(aggregate_type.as_bytes());
        hasher.update(aggregate_id.as_bytes());
        hasher.update(payload.as_bytes());
        hasher.update(timestamp.as_bytes());
        format!("{:x}", hasher.finalize())
    }
}

// ==========================================
// Milestone 3: Security & Capability Models
// ==========================================

/// Irreversibility & Effect Classes (0 - 3) per 07-security-model.md §2
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub enum EffectClass {
    Class0_Read = 0,
    Class1_ReversibleLocal = 1,
    Class2_IrreversibleExternal = 2,
    Class3_CriticalHumanSignature = 3,
}

/// Explicit Capability Grant per ADR-0006
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct Capability {
    pub capability_id: String,
    pub grantee_agent_id: String,
    pub resource: String,
    pub max_effect_class: EffectClass,
    pub is_revoked: bool,
}

/// Hard Autonomy Fence Rules per Principle 6 & 07-security-model.md §4
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct Fence {
    pub allowed_directories: Vec<String>,
    pub egress_allowlist: Vec<String>,
    pub max_effect_class: EffectClass,
    pub spend_ceiling_usd: f64,
}

/// Approval Request created when crossing a Fence boundary
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct ApprovalRequest {
    pub request_id: String,
    pub agent_id: String,
    pub action: String,
    pub resource: String,
    pub effect_class: EffectClass,
    pub reason: String,
}

/// Provenance Tag embedded in Message Envelopes per 07-security-model.md §6
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct ProvenanceTag {
    pub author_agent_id: String,
    pub author_role: String,
    pub authorized_by_principal: bool,
    pub capability_id: String,
    pub effect_class: EffectClass,
}

/// Message Envelope carrying mandatory Provenance metadata
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Envelope<T> {
    pub payload: T,
    pub provenance: ProvenanceTag,
}

// ==========================================
// Milestone 4: Memory Engine & Working Memory
// ==========================================

/// Single chunk of indexed text with vector embedding per ADR-0004
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct MemoryChunk {
    pub chunk_id: String,
    pub source_id: String,
    pub content: String,
    pub token_count: usize,
    pub embedding: Vec<f32>,
    pub created_at: String,
}

/// Hybrid search result item with RRF score and rank details
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct SearchResult {
    pub chunk: MemoryChunk,
    pub rrf_score: f32,
    pub fts_rank: Option<usize>,
    pub vector_rank: Option<usize>,
}

/// Assembled Context Window for LLM inference with token budgeting
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct ContextWindow {
    pub items: Vec<MemoryChunk>,
    pub total_tokens: usize,
    pub max_token_budget: usize,
}

// ==========================================
// Milestone 5: Model Abstraction & Router
// ==========================================

/// Normalized Chat Message per ADR-0005
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
    pub name: Option<String>,
}

/// Normalized Tool Specification for Model Providers
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct ToolDefinition {
    pub name: String,
    pub description: String,
    pub parameters_json: String,
}

/// Normalized Tool Call Response generated by Model Providers
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct ToolCall {
    pub id: String,
    pub name: String,
    pub arguments_json: String,
}

/// Token & Financial Cost Accounting per 06-model-routing-and-llm.md §4
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct TokenUsage {
    pub prompt_tokens: usize,
    pub completion_tokens: usize,
    pub total_tokens: usize,
    pub estimated_cost_usd: f64,
}

/// Provider-Agnostic Completion Request
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct CompletionRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
    pub tools: Vec<ToolDefinition>,
    pub temperature: Option<f32>,
    pub max_tokens: Option<usize>,
}

/// Provider-Agnostic Completion Response
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../bindings/src/index.ts")]
pub struct CompletionResponse {
    pub id: String,
    pub content: String,
    pub tool_calls: Vec<ToolCall>,
    pub usage: TokenUsage,
    pub provider_name: String,
}
