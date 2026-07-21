use sidra_domain::{
    AppStatus, ApprovalRequest, BriefStatus, Capability, ChatMessage, CompletionRequest,
    CompletionResponse, ContextWindow, EffectClass, EngagementId, Event, Fence, MemoryChunk,
    ProvenanceTag, SearchResult, SystemInfo, TokenUsage, ToolDefinition, ToolCall,
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
}
