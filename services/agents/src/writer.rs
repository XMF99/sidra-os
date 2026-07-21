use crate::agent_trait::{create_default_task_plan, Agent};
use sidra_domain::{ChatMessage, CompletionRequest, TaskPlan, TaskStatus, TaskStep};
use sidra_models::ModelRouter;
use ulid::Ulid;

pub struct WriterAgent;

impl Agent for WriterAgent {
    fn role(&self) -> &'static str {
        "writer"
    }

    fn decompose_goal(&self, goal: &str, router: &ModelRouter) -> TaskPlan {
        let req = CompletionRequest {
            model: "auto".to_string(),
            messages: vec![ChatMessage {
                role: "user".to_string(),
                content: format!("Decompose brief formatting goal: {}", goal),
                name: None,
            }],
            tools: vec![],
            temperature: Some(0.3),
            max_tokens: Some(100),
        };

        let _resp = router.complete_with_fallback(&req);

        let step1 = TaskStep {
            step_id: format!("step_{}", Ulid::new()),
            description: "Format retrieved search results into executive brief".to_string(),
            assigned_role: "writer".to_string(),
            status: TaskStatus::Pending,
            result: None,
        };

        create_default_task_plan(goal, vec![step1])
    }
}
