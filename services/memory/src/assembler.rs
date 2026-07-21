use sidra_domain::{ContextWindow, MemoryChunk};

pub struct ContextWindowAssembler;

impl ContextWindowAssembler {
    /// Assemble memory chunks into a deterministic ContextWindow budget max_token_budget
    pub fn assemble_context(candidates: Vec<MemoryChunk>, max_token_budget: usize) -> ContextWindow {
        let mut assembled_items = Vec::new();
        let mut current_token_count = 0;

        for chunk in candidates {
            if current_token_count + chunk.token_count <= max_token_budget {
                current_token_count += chunk.token_count;
                assembled_items.push(chunk);
            } else {
                // Budget ceiling reached, stop appending lower-ranked candidates
                break;
            }
        }

        ContextWindow {
            items: assembled_items,
            total_tokens: current_token_count,
            max_token_budget,
        }
    }
}
