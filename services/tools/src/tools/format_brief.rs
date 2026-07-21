use crate::tool_trait::Tool;
use sidra_domain::EffectClass;

pub struct FormatBriefTool;

impl Tool for FormatBriefTool {
    fn name(&self) -> &'static str {
        "format_executive_brief"
    }

    fn description(&self) -> &'static str {
        "Format memory search results into an executive brief"
    }

    fn effect_class(&self) -> EffectClass {
        EffectClass::Class1_ReversibleLocal
    }

    fn execute(&self, parameters_json: &str) -> Result<String, String> {
        let val: serde_json::Value = serde_json::from_str(parameters_json)
            .map_err(|e| format!("Invalid params: {}", e))?;
        let topic = val["topic"].as_str().unwrap_or("Executive Brief");
        Ok(format!("# Executive Brief: {}\n- Key Finding 1\n- Key Finding 2", topic))
    }
}
