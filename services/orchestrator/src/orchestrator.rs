use rusqlite::Connection;
use sidra_agents::{Agent, AnalystAgent, WriterAgent};
use sidra_domain::{
    AgentMessage, Capability, EffectClass, EventInput, ProvenanceTag, TaskPlan, TaskStatus,
};
use sidra_models::ModelRouter;
use sidra_security::PermissionBroker;
use sidra_store::EventLogRepository;
use sidra_tools::{FormatBriefTool, IngestTool, Tool, VectorSearchTool};
use std::collections::HashMap;

pub struct Orchestrator {
    router: ModelRouter,
    broker: PermissionBroker,
    analyst: AnalystAgent,
    writer: WriterAgent,
    tools: HashMap<String, Box<dyn Tool>>,
}

impl Orchestrator {
    pub fn new(router: ModelRouter, broker: PermissionBroker) -> Self {
        let mut tools: HashMap<String, Box<dyn Tool>> = HashMap::new();
        tools.insert("ingest_document".to_string(), Box::new(IngestTool));
        tools.insert("vector_search".to_string(), Box::new(VectorSearchTool));
        tools.insert("format_executive_brief".to_string(), Box::new(FormatBriefTool));

        Self {
            router,
            broker,
            analyst: AnalystAgent,
            writer: WriterAgent,
            tools,
        }
    }

    pub fn broker_mut(&mut self) -> &mut PermissionBroker {
        &mut self.broker
    }

    /// Decompose goal and execute multi-step multi-agent task workflow
    pub fn execute_goal(
        &self,
        conn: &Connection,
        goal: &str,
    ) -> Result<(TaskPlan, Vec<AgentMessage>), String> {
        // 1. Decompose plan with AnalystAgent
        let mut plan = self.analyst.decompose_goal(goal, &self.router);
        plan.status = TaskStatus::Executing;

        // Log task plan created event
        EventLogRepository::append(
            conn,
            &EventInput {
                event_id: ulid::Ulid::new().to_string(),
                event_type: "task.plan_created".to_string(),
                aggregate_type: "task".to_string(),
                aggregate_id: plan.plan_id.clone(),
                payload: serde_json::to_string(&plan).unwrap(),
                metadata: r#"{"subsystem":"sidra-orchestrator"}"#.to_string(),
                timestamp: "2026-07-21T12:00:00Z".to_string(),
            },
        )
        .map_err(|e| e.to_string())?;

        let mut messages = Vec::new();
        let capability_id = "cap_analyst_exec";

        // 2. Execute Steps
        for step in &mut plan.steps {
            step.status = TaskStatus::Executing;

            let (tool_name, tool_params, agent_id) = match step.assigned_role.as_str() {
                "analyst" => (
                    if step.description.contains("Ingest") {
                        "ingest_document"
                    } else {
                        "vector_search"
                    },
                    r#"{"content":"Sample Executive Text","query":"Executive"}"#,
                    "agent_analyst_01",
                ),
                _ => (
                    "format_executive_brief",
                    r#"{"topic":"Executive Security Brief"}"#,
                    "agent_writer_01",
                ),
            };

            let tool = self
                .tools
                .get(tool_name)
                .ok_or_else(|| format!("Tool {} not found", tool_name))?;

            // 3. Security Broker Capability Authorization Check (ADR-0008)
            let _approval = self
                .broker
                .authorize_action(
                    conn,
                    agent_id,
                    capability_id,
                    &format!("tool:{}", tool_name),
                    "system",
                    tool.effect_class(),
                )
                .map_err(|e| format!("Security check failed: {}", e))?;

            // 4. Log tool execution started
            EventLogRepository::append(
                conn,
                &EventInput {
                    event_id: ulid::Ulid::new().to_string(),
                    event_type: "tool.execution_started".to_string(),
                    aggregate_type: "tool".to_string(),
                    aggregate_id: tool_name.to_string(),
                    payload: serde_json::json!({
                        "agent_id": agent_id,
                        "tool": tool_name
                    })
                    .to_string(),
                    metadata: r#"{"subsystem":"sidra-orchestrator"}"#.to_string(),
                    timestamp: "2026-07-21T12:00:00Z".to_string(),
                },
            )
            .map_err(|e| e.to_string())?;

            // 5. Execute Tool
            let output = tool.execute(tool_params)?;
            step.result = Some(output.clone());
            step.status = TaskStatus::Completed;

            // 6. Record inter-agent message with Mandatory Provenance Tagging (ADR-0007)
            let msg = AgentMessage {
                message_id: format!("msg_{}", ulid::Ulid::new()),
                sender_id: agent_id.to_string(),
                receiver_id: "orchestrator".to_string(),
                content: output,
                provenance: ProvenanceTag {
                    author_agent_id: agent_id.to_string(),
                    author_role: step.assigned_role.clone(),
                    authorized_by_principal: true,
                    capability_id: capability_id.to_string(),
                    effect_class: tool.effect_class(),
                },
            };
            messages.push(msg);

            // 7. Log tool execution completed
            EventLogRepository::append(
                conn,
                &EventInput {
                    event_id: ulid::Ulid::new().to_string(),
                    event_type: "tool.execution_completed".to_string(),
                    aggregate_type: "tool".to_string(),
                    aggregate_id: tool_name.to_string(),
                    payload: serde_json::json!({
                        "agent_id": agent_id,
                        "tool": tool_name,
                        "status": "success"
                    })
                    .to_string(),
                    metadata: r#"{"subsystem":"sidra-orchestrator"}"#.to_string(),
                    timestamp: "2026-07-21T12:00:00Z".to_string(),
                },
            )
            .map_err(|e| e.to_string())?;
        }

        plan.status = TaskStatus::Completed;
        Ok((plan, messages))
    }
}
