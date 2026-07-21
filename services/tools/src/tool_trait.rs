use sidra_domain::EffectClass;

pub trait Tool: Send + Sync {
    fn name(&self) -> &'static str;
    fn description(&self) -> &'static str;
    fn effect_class(&self) -> EffectClass;
    fn execute(&self, parameters_json: &str) -> Result<String, String>;
}
