use sidra_domain::MemoryChunk;
use sidra_memory::{
    ContextWindowAssembler, HybridSearchEngine, VectorStore, WorkingMemoryBuffer,
};
use std::time::Instant;
use ulid::Ulid;

#[test]
fn test_m4_exit_criterion_50k_chunks_sub_50ms_hybrid_search() {
    let mut vector_store = VectorStore::new();

    // 1. Ingest 50,000 embedded memory chunks
    let mut chunks = Vec::with_capacity(50000);
    for i in 1..=50000 {
        let embedding = vec![(i as f32) % 10.0, ((i * 2) as f32) % 10.0, ((i * 3) as f32) % 10.0];
        chunks.push(MemoryChunk {
            chunk_id: Ulid::new().to_string(),
            source_id: format!("doc_{:05}", i % 500),
            content: format!("Sidra OS Memory Engine Chunk content item number {}", i),
            token_count: 12,
            embedding,
            created_at: "2026-07-21T12:00:00Z".to_string(),
        });
    }
    vector_store.insert_batch(chunks);

    let search_engine = HybridSearchEngine::new(vector_store);

    // 2. Measure hybrid search execution speed (query_text, query_vector, top_k = 10)
    let query_vector = vec![5.0, 4.0, 3.0];
    let start_time = Instant::now();
    let results = search_engine.hybrid_search("Memory Engine content", &query_vector, 10);
    let elapsed = start_time.elapsed();

    // Assert top-k=10 returned
    assert_eq!(results.len(), 10, "Hybrid search MUST return exactly top-k 10 items");

    // Assert sub-50ms performance requirement per ADR-0004 & M4 exit criteria
    println!("50,000 Chunks Hybrid Search Elapsed Time: {:?}", elapsed);
    assert!(
        elapsed.as_millis() < 50,
        "Hybrid search on 50,000 chunks took {:?}, which exceeds sub-50ms latency limit",
        elapsed
    );

    // 3. Verify Deterministic Context Window Assembly
    let candidate_chunks: Vec<MemoryChunk> = results.into_iter().map(|r| r.chunk).collect();
    let max_budget = 50; // max 50 tokens
    let context_window = ContextWindowAssembler::assemble_context(candidate_chunks, max_budget);

    assert!(
        context_window.total_tokens <= max_budget,
        "Assembled context tokens ({}) MUST NOT exceed max token budget ({})",
        context_window.total_tokens,
        max_budget
    );
    assert!(
        !context_window.items.is_empty(),
        "Context window MUST contain assembled memory items"
    );
}

#[test]
fn test_working_memory_lru_eviction() {
    let working_memory = WorkingMemoryBuffer::new(3);

    for i in 1..=5 {
        working_memory.push(MemoryChunk {
            chunk_id: format!("chk_{}", i),
            source_id: "src_active".to_string(),
            content: format!("Active Turn {}", i),
            token_count: 5,
            embedding: vec![1.0, 2.0, 3.0],
            created_at: "2026-07-21T12:00:00Z".to_string(),
        });
    }

    assert_eq!(
        working_memory.len(),
        3,
        "Working memory buffer capacity MUST be capped at max_capacity (3)"
    );

    let items = working_memory.get_all();
    assert_eq!(items[0].chunk_id, "chk_3", "Oldest items (1 & 2) MUST be evicted by LRU strategy");
    assert_eq!(items[2].chunk_id, "chk_5");
}
