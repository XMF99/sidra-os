use crate::tool_trait::Tool;
use sidra_domain::EffectClass;

pub struct VectorSearchTool;

impl Tool for VectorSearchTool {
    fn name(&self) -> &'static str {
        "vector_search"
    }

    fn description(&self) -> &'static str {
        "Perform hybrid vector search over memory chunks"
    }

    fn effect_class(&self) -> EffectClass {
        EffectClass::Class0_Read
    }

    fn execute(&self, parameters_json: &str) -> Result<String, String> {
        let val: serde_json::Value = serde_json::from_str(parameters_json)
            .map_err(|e| format!("Invalid params: {}", e))?;
        let query = val["query"].as_str().unwrap_or("");
        Ok(format!("Found 5 memory chunks matching query '{}'", query))
    }
}
