//! Sidra OS Agents Service (AnalystAgent, WriterAgent, Agent Traits)

pub mod agent_trait;
pub mod analyst;
pub mod writer;

pub use agent_trait::Agent;
pub use analyst::AnalystAgent;
pub use writer::WriterAgent;
