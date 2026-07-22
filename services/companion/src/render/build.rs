use sha2::{Sha256, Digest};
use super::payload::{BriefNode, BriefSection, BriefRenderPayload};

pub fn build_brief_render_payload(
    brief_id: &str,
    situation: &str,
    actions: &str,
    findings: &str,
    recommendation: &str,
    the_ask: &str,
    confidence_score: f64,
) -> BriefRenderPayload {
    let sections = vec![
        BriefSection { name: "situation".to_string(), nodes: vec![BriefNode::Paragraph(situation.to_string())] },
        BriefSection { name: "actions".to_string(), nodes: vec![BriefNode::Paragraph(actions.to_string())] },
        BriefSection { name: "findings".to_string(), nodes: vec![BriefNode::Paragraph(findings.to_string())] },
        BriefSection { name: "recommendation".to_string(), nodes: vec![BriefNode::Paragraph(recommendation.to_string())] },
        BriefSection { name: "the_ask".to_string(), nodes: vec![BriefNode::Paragraph(the_ask.to_string())] },
        BriefSection { name: "confidence".to_string(), nodes: vec![BriefNode::Paragraph(format!("Confidence: {:.2}", confidence_score))] },
    ];

    let mut hasher = Sha256::new();
    let json_bytes = serde_json::to_vec(&sections).unwrap_or_default();
    hasher.update(&json_bytes);
    let hash_result = hasher.finalize();
    let content_hash = format!("{:x}", hash_result);

    BriefRenderPayload {
        brief_id: brief_id.to_string(),
        sections,
        the_ask: the_ask.to_string(),
        confidence_score,
        content_hash,
    }
}
