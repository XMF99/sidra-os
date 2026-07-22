use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum BriefNode {
    Heading(String),
    Paragraph(String),
    ListItem(String),
    Emphasis(String),
    CodeSpan(String),
    LinkToTrace { label: String, trace_id: String },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct BriefSection {
    pub name: String,
    pub nodes: Vec<BriefNode>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct BriefRenderPayload {
    pub brief_id: String,
    pub sections: Vec<BriefSection>, // 6 sections in fixed order: situation, actions, findings, recommendation, the_ask, confidence
    pub the_ask: String,
    pub confidence_score: f64,
    pub content_hash: String,
}
