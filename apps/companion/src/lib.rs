pub use sidra_companion::domain::outbox::{ApprovalOutboxEntry, ApprovalVerdict};
pub use sidra_companion::domain::values::{ContentHash, DeviceId, DevicePublicKey, Signature};
pub use sidra_companion::pairing::key::DeviceKeyPair;
pub use sidra_companion::render::payload::{BriefNode, BriefRenderPayload, BriefSection};

pub struct BriefPainter;

impl BriefPainter {
    /// Paints the canonical render payload verbatim without any markdown parser or sanitizer.
    pub fn paint(payload: &BriefRenderPayload) -> Vec<String> {
        let mut lines = Vec::new();
        lines.push(format!("Brief: {}", payload.brief_id));
        lines.push(format!("Ask: {}", payload.the_ask));
        lines.push(format!("ContentHash: {}", payload.content_hash));

        for section in &payload.sections {
            lines.push(format!("-- Section: {} --", section.name));
            for node in &section.nodes {
                match node {
                    BriefNode::Heading(text) => lines.push(format!("# {}", text)),
                    BriefNode::Paragraph(text) => lines.push(text.clone()),
                    BriefNode::ListItem(text) => lines.push(format!("* {}", text)),
                    BriefNode::Emphasis(text) => lines.push(format!("*{}*", text)),
                    BriefNode::CodeSpan(text) => lines.push(format!("`{}`", text)),
                    BriefNode::LinkToTrace { label, trace_id } => {
                        lines.push(format!("[{}] (trace: {})", label, trace_id))
                    }
                }
            }
        }
        lines
    }
}

#[derive(Default)]
pub struct ApprovalCapture {
    pub outbox: Vec<ApprovalOutboxEntry>,
}

impl ApprovalCapture {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn capture_approval(
        &mut self,
        keypair: &DeviceKeyPair,
        device_id: DeviceId,
        approval_request_id: &str,
        verdict: ApprovalVerdict,
        grant_scope: Option<String>,
        now: u64,
    ) -> ApprovalOutboxEntry {
        let entry_id = format!("outbox-{}", now);
        let payload = format!("{}:{}:{:?}:{}", entry_id, approval_request_id, verdict, now);
        let sig = keypair.sign(payload.as_bytes());

        let entry = ApprovalOutboxEntry {
            outbox_entry_id: entry_id,
            approval_request_id: approval_request_id.to_string(),
            verdict,
            grant_scope,
            decided_at: now,
            device_id,
            signature: sig,
        };
        self.outbox.push(entry.clone());
        entry
    }
}
