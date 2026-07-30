# THEKY Engineering Architecture: AI Runtime Architecture

**Document ID:** `E01-05`  
**Status:** `IMPLEMENTATION-GRADE`  
**Governing Authority:** `E00 Engineering Constitution`  
**Target Path:** `engineering/E01-engineering-architecture/05-ai-runtime-architecture.md`  

---

## 1. Executive AI Architecture & Five Core Tools (ADR-0004)

The AI Engine in THEKY is structured as an autonomous, goal-driven executive agent runtime. Every agent, regardless of its departmental assignment, is constrained to five executive tool capabilities:

```
                      +-----------------------------+
                      |      EXECUTIVE AGENT        |
                      +-----------------------------+
                                     |
    +-----------------+--------------+--------------+-----------------+
    |                 |                             |                 |
    v                 v                             v                 v
[ 1. RETRIEVE ]  [ 2. DELEGATE ]              [ 3. CONVENE ]    [ 4. DECIDE ]
Fetch Vault      Assign task to               Form multi-agent  Formulate binding
Data & Context   Sub-agent worker             deliberation      decision payload
                                     |
                                     v
                               [ 5. REPORT ]
                               Emit Single Brief
                               (≤ 600 words)
```

### 1.1 Tool Definitions & Constraints
1. **Retrieve:** Queries vector store, event log projections, and department data schemas under strict Permission Broker capabilities.
2. **Delegate:** Spawns sub-agent workers for specific sub-tasks with non-overlapping execution scopes.
3. **Convene:** Initiates multi-agent round-table evaluation across department executives.
4. **Decide:** Finalizes state mutation parameters and submits IPC command proposals.
5. **Report:** Generates synthesized, human-readable briefs. **Strict constraint:** Max 600 words per brief regardless of worker count.

---

## 2. Mission Execution Pipeline

Agent missions execute as finite state machines (FSM) managed by `services/ai-runtime`:

```
 [ INITIATED ] ---> ( Parse Brief & Objective )
       |
       v
   [ PLAN ]    ---> ( Decompose into DAG of Sub-tasks )
       |
       v
 [ EXECUTE ]   ---> ( Invoke Executive Tools & Sub-agents )
       |
       v
  [ VERIFY ]   ---> ( Automated Evaluation Set Check ) --- [ Failed ] ---> [ REFINE ]
       |                                                                     |
       | [ Passed ]                                                          | Re-plan
       v                                                                     v
[ COMPLETED ] <--------------------------------------------------------------+
```

### 2.1 Mission State Transitions
- **PLAN:** Generates an acyclic execution graph (DAG) mapping sub-tasks to specific tool calls or sub-agent charters.
- **EXECUTE:** Runs tasks concurrently up to the department's allocated thread/token sub-ceiling.
- **VERIFY:** Evaluates task output against attached evaluation criteria (Golden Test Vectors).
- **REFINE:** If verification fails, the planner adjusts parameters up to a maximum retry limit of 3 before escalating to human operator.

---

## 3. Memory Architecture & RAG Pipeline

Agent memory is partitioned across three tiers:

```
+-----------------------------------------------------------------------------------+
| 1. SHORT-TERM CONTEXT WINDOW (In-Memory Ring Buffer)                              |
| - Current conversation messages & system prompt                                  |
| - Active turn tokens managed with sliding window trimming                        |
+-----------------------------------------------------------------------------------+
                                         ^
                                         | Dynamic Retrieval
+-----------------------------------------------------------------------------------+
| 2. WORKING SCRATCHPAD (Task File Storage)                                         |
| - Intermediate step outputs & JSON artifacts saved in `<vault>/scratch/`          |
+-----------------------------------------------------------------------------------+
                                         ^
                                         | Vector Search
+-----------------------------------------------------------------------------------+
| 3. LONG-TERM VECTOR VAULT (Embedded Vector Engine: sqlite-vec / HNSW)             |
| - Embeddings generated via local embedding model (`all-MiniLM-L6-v2`)            |
| - Semantic search over past event logs, documents, and department knowledge base  |
+-----------------------------------------------------------------------------------+
```

---

## 4. Model Routing & Multi-Provider Abstraction

The Model Router dynamically selects LLM providers based on task complexity, cost budget, latency requirements, and privacy policies:

```rust
// Model Provider Abstraction Trait (services/ai-runtime/src/provider.rs)
#[async_trait::async_trait]
pub trait ModelProvider: Send + Sync {
    async fn generate_completion(
        &self, 
        request: &CompletionRequest
    ) -> Result<CompletionResponse, ProviderError>;

    async fn generate_stream(
        &self,
        request: &CompletionRequest
    ) -> Result<TokenStream, ProviderError>;
}
```

### 4.1 Fallback & Routing Policy Matrix

| Tier | Task Type | Primary Provider | Fallback Provider | Target Latency | Privacy Level |
|---|---|---|---|---|---|
| **Tier 1 (Critical)** | Core Decision & Brief Synthesis | Local Sidecar (`llama-3.1-8b`) | Cloud Anthropic (Claude 3.5) | ≤ 1200 ms | Strict Local / Encrypted |
| **Tier 2 (Heavy)** | Code Gen & Complex Planning | Cloud Anthropic / OpenAI | Cloud Gemini Pro | ≤ 3000 ms | Anonymized Payload |
| **Tier 3 (Fast)** | Semantic Embedding & Classification | Local Embedding (`sqlite-vec`) | Local Small Model | ≤ 100 ms | Strict Local |

---
