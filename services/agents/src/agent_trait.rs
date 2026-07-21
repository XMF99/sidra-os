use sidra_domain::{ChatMessage, CompletionRequest, TaskPlan, TaskStatus, TaskStep};
use sidra_models::ModelRouter;
use ulid::Ulid;

pub trait Agent: Send + Sync {
    fn role(&self) -> &'static str;
    fn decompose_goal(&self, goal: &str, router: &ModelRouter) -> TaskPlan;
}

pub fn create_default_task_plan(goal: &str, steps: Vec<TaskStep>) -> TaskPlan {
    TaskPlan {
        plan_id: format!("plan_{}", Ulid::new()),
        goal: goal.to_string(),
        steps,
        status: TaskStatus::Planning,
    }
}
