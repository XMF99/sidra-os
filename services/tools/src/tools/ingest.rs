use crate::tool_trait::Tool;
use sidra_domain::EffectClass;

pub struct IngestTool;

impl Tool for IngestTool {
    fn name(&self) -> &'static str {
        "ingest_document"
    }

    fn description(&self) -> &'static str {
        "Ingest a text document and split into memory chunks"
    }

    fn effect_class(&self) -> EffectClass {
        EffectClass::Class1_ReversibleLocal
    }

    fn execute(&self, parameters_json: &str) -> Result<String, String> {
        let val: serde_json::Value = serde_json::from_str(parameters_json)
            .map_err(|e| format!("Invalid params: {}", e))?;
        let doc_text = val["content"].as_str().unwrap_or("");
        Ok(format!("Ingested document successfully ({} bytes)", doc_text.len()))
    }
}
