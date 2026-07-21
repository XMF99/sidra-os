use sidra_domain::MemoryChunk;
use std::sync::{Arc, RwLock};

#[derive(Clone)]
pub struct WorkingMemoryBuffer {
    max_capacity: usize,
    buffer: Arc<RwLock<Vec<MemoryChunk>>>,
}

impl WorkingMemoryBuffer {
    pub fn new(max_capacity: usize) -> Self {
        Self {
            max_capacity,
            buffer: Arc::new(RwLock::new(Vec::new())),
        }
    }

    /// Push new working memory item, evicting oldest item if buffer exceeds max_capacity
    pub fn push(&self, chunk: MemoryChunk) {
        let mut buf = self.buffer.write().unwrap();
        buf.push(chunk);
        if buf.len() > self.max_capacity {
            buf.remove(0); // LRU eviction of oldest active item
        }
    }

    /// Retrieve all active working memory chunks
    pub fn get_all(&self) -> Vec<MemoryChunk> {
        let buf = self.buffer.read().unwrap();
        buf.clone()
    }

    /// Clear all working memory items
    pub fn clear(&self) {
        let mut buf = self.buffer.write().unwrap();
        buf.clear();
    }

    pub fn len(&self) -> usize {
        let buf = self.buffer.read().unwrap();
        buf.len()
    }

    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }
}
