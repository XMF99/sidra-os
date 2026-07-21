use sidra_domain::MemoryChunk;
use ulid::Ulid;

pub struct ChunkingEngine {
    chunk_size_chars: usize,
    overlap_chars: usize,
}

impl ChunkingEngine {
    pub fn new(chunk_size_chars: usize, overlap_chars: usize) -> Self {
        Self {
            chunk_size_chars,
            overlap_chars,
        }
    }

    /// Split source text into overlapping MemoryChunk objects with estimated token counts
    pub fn chunk_text(&self, source_id: &str, text: &str, dummy_embedding: &[f32]) -> Vec<MemoryChunk> {
        let mut chunks = Vec::new();
        let chars: Vec<char> = text.chars().collect();
        let total_chars = chars.len();

        if total_chars == 0 {
            return chunks;
        }

        let mut start = 0;
        while start < total_chars {
            let end = (start + self.chunk_size_chars).min(total_chars);
            let content: String = chars[start..end].iter().collect();
            let token_count = content.split_whitespace().count().max(1);

            chunks.push(MemoryChunk {
                chunk_id: Ulid::new().to_string(),
                source_id: source_id.to_string(),
                content,
                token_count,
                embedding: dummy_embedding.to_vec(),
                created_at: "2026-07-21T12:00:00Z".to_string(),
            });

            if end == total_chars {
                break;
            }
            start += self.chunk_size_chars.saturating_sub(self.overlap_chars).max(1);
        }

        chunks
    }
}
