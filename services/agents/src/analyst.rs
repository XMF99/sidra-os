use crate::agent_trait::{create_default_task_plan, Agent};
use sidra_domain::{ChatMessage, CompletionRequest, TaskPlan, TaskStatus, TaskStep};
use sidra_models::ModelRouter;
use ulid::Ulid;

pub struct AnalystAgent;

impl Agent for AnalystAgent {
    fn role(&self) -> &'static str {
        "analyst"
    }

    fn decompose_goal(&self, goal: &str, router: &ModelRouter) -> TaskPlan {
        let req = CompletionRequest {
            model: "auto".to_string(),
            messages: vec![ChatMessage {
                role: "user".to_string(),
                content: format!("Decompose analysis goal: {}", goal),
                name: None,
            }],
            tools: vec![],
            temperature: Some(0.2),
            max_tokens: Some(100),
        };

        // Query model router for plan guidance
        let _resp = router.complete_with_fallback(&req);

        let step1 = TaskStep {
            step_id: format!("step_{}", Ulid::new()),
            description: "Ingest target document and generate chunks".to_string(),
            assigned_role: "analyst".to_string(),
            status: TaskStatus::Pending,
            result: None,
        };

        let step2 = TaskStep {
            step_id: format!("step_{}", Ulid::new()),
            description: "Perform hybrid vector search over memory store".to_string(),
            assigned_role: "analyst".to_string(),
            status: TaskStatus::Pending,
            result: None,
        };

        create_default_task_plan(goal, vec![step1, step2])
    }
}
