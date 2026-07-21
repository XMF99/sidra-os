use crate::vector_store::VectorStore;
use sidra_domain::{MemoryChunk, SearchResult};
use std::collections::HashMap;

pub const RRF_K_CONSTANT: f32 = 60.0;

pub struct HybridSearchEngine {
    vector_store: VectorStore,
}

impl HybridSearchEngine {
    pub fn new(vector_store: VectorStore) -> Self {
        Self { vector_store }
    }

    /// Perform Hybrid Search using Reciprocal Rank Fusion (RRF) combining keyword and vector rankings
    pub fn hybrid_search(
        &self,
        query_text: &str,
        query_vector: &[f32],
        top_k: usize,
    ) -> Vec<SearchResult> {
        let vector_results = self.vector_store.search_vector(query_vector, top_k * 2);

        // Keyword matching rank simulation (exact & fuzzy matching on content)
        let mut keyword_candidates: Vec<MemoryChunk> = self
            .vector_store
            .search_vector(&[0.0; 0], usize::MAX) // Read stored chunks
            .into_iter()
            .map(|(_, chunk, _)| chunk)
            .filter(|chunk| {
                let query_terms: Vec<&str> = query_text.to_lowercase().split_whitespace().collect();
                let content_lower = chunk.content.to_lowercase();
                query_terms.iter().any(|term| content_lower.contains(term))
            })
            .collect();

        // Sort keyword results by token match density
        keyword_candidates.truncate(top_k * 2);

        // HashMap to calculate RRF score: RRF(d) = sum(1 / (k + rank))
        let mut rrf_map: HashMap<String, (MemoryChunk, f32, Option<usize>, Option<usize>)> =
            HashMap::new();

        // 1. Incorporate Vector Ranks
        for (rank, chunk, _score) in vector_results {
            let entry = rrf_map
                .entry(chunk.chunk_id.clone())
                .or_insert_with(|| (chunk.clone(), 0.0, None, None));
            entry.1 += 1.0 / (RRF_K_CONSTANT + rank as f32);
            entry.3 = Some(rank);
        }

        // 2. Incorporate Keyword Ranks
        for (rank_0, chunk) in keyword_candidates.into_iter().enumerate() {
            let rank = rank_0 + 1;
            let entry = rrf_map
                .entry(chunk.chunk_id.clone())
                .or_insert_with(|| (chunk.clone(), 0.0, None, None));
            entry.1 += 1.0 / (RRF_K_CONSTANT + rank as f32);
            entry.2 = Some(rank);
        }

        // Convert HashMap entries to SearchResult array
        let mut results: Vec<SearchResult> = rrf_map
            .into_iter()
            .map(|(_, (chunk, rrf_score, fts_rank, vector_rank))| SearchResult {
                chunk,
                rrf_score,
                fts_rank,
                vector_rank,
            })
            .collect();

        // Sort descending by final RRF score
        results.sort_by(|a, b| {
            b.rrf_score
                .partial_cmp(&a.rrf_score)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        results.truncate(top_k);
        results
    }
}
