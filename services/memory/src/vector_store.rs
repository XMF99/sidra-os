use sidra_domain::MemoryChunk;

pub struct VectorStore {
    chunks: Vec<MemoryChunk>,
}

impl VectorStore {
    pub fn new() -> Self {
        Self { chunks: Vec::new() }
    }

    pub fn insert(&mut self, chunk: MemoryChunk) {
        self.chunks.push(chunk);
    }

    pub fn insert_batch(&mut self, chunks: Vec<MemoryChunk>) {
        self.chunks.extend(chunks);
    }

    /// Calculate Cosine Similarity between two float vectors
    pub fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
        if a.len() != b.len() || a.is_empty() {
            return 0.0;
        }

        let dot_product: f32 = a.iter().zip(b.iter()).map(|(x, y)| x * y).sum();
        let norm_a: f32 = a.iter().map(|x| x * x).sum::<f32>().sqrt();
        let norm_b: f32 = b.iter().map(|x| x * x).sum::<f32>().sqrt();

        if norm_a == 0.0 || norm_b == 0.0 {
            return 0.0;
        }

        dot_product / (norm_a * norm_b)
    }

    /// Search top-K nearest chunks by vector cosine similarity
    pub fn search_vector(
        &self,
        query_vector: &[f32],
        top_k: usize,
    ) -> Vec<(usize, MemoryChunk, f32)> {
        let mut scored: Vec<(usize, MemoryChunk, f32)> = self
            .chunks
            .iter()
            .cloned()
            .map(|chunk| {
                let score = Self::cosine_similarity(query_vector, &chunk.embedding);
                (0, chunk, score)
            })
            .collect();

        // Sort descending by score
        scored.sort_by(|a, b| b.2.partial_cmp(&a.2).unwrap_or(std::cmp::Ordering::Equal));
        scored.truncate(top_k);

        // Assign ranks (1-indexed)
        scored
            .into_iter()
            .enumerate()
            .map(|(rank, (_, chunk, score))| (rank + 1, chunk, score))
            .collect()
    }
}

impl Default for VectorStore {
    fn default() -> Self {
        Self::new()
    }
}
