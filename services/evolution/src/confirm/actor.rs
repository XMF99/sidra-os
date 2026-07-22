pub struct ConfirmActorGuard;

impl ConfirmActorGuard {
    pub fn assert_principal_seat(actor: &str) -> Result<(), String> {
        if actor.starts_with("agent:") || actor.starts_with("archetype:") {
            return Err("An agent actor cannot confirm a charter revision (GUIDE §3 item 9)".to_string());
        }
        Ok(())
    }
}
