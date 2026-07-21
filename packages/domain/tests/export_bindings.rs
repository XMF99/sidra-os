use sidra_domain::{
    AgentMessage, AgentState, AppStatus, ApprovalRequest, BriefStatus, Capability, ChatMessage,
    CompletionRequest, CompletionResponse, ContextWindow, EffectClass, EngagementId, Event, Fence,
    MemoryChunk, PluginInfo, PluginManifest, PluginStatus, ProvenanceTag, SearchResult, SystemInfo,
    TaskPlan, TaskStatus, TaskStep, TokenUsage, ToolDefinition, ToolCall,
};
use ts_rs::TS;

#[test]
fn export_ts_bindings() {
    EngagementId::export_all().unwrap();
    AppStatus::export_all().unwrap();
    BriefStatus::export_all().unwrap();
    SystemInfo::export_all().unwrap();
    Event::export_all().unwrap();
    EffectClass::export_all().unwrap();
    Capability::export_all().unwrap();
    Fence::export_all().unwrap();
    ApprovalRequest::export_all().unwrap();
    ProvenanceTag::export_all().unwrap();
    MemoryChunk::export_all().unwrap();
    SearchResult::export_all().unwrap();
    ContextWindow::export_all().unwrap();
    ChatMessage::export_all().unwrap();
    ToolDefinition::export_all().unwrap();
    ToolCall::export_all().unwrap();
    TokenUsage::export_all().unwrap();
    CompletionRequest::export_all().unwrap();
    CompletionResponse::export_all().unwrap();
    TaskStatus::export_all().unwrap();
    AgentState::export_all().unwrap();
    TaskStep::export_all().unwrap();
    TaskPlan::export_all().unwrap();
    AgentMessage::export_all().unwrap();
    PluginStatus::export_all().unwrap();
    PluginManifest::export_all().unwrap();
    PluginInfo::export_all().unwrap();
}
