use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize, Deserialize)]
pub struct Hlc {
    pub wall_ms: u64,
    pub counter: u32,
}

impl Hlc {
    pub fn new(wall_ms: u64, counter: u32) -> Self {
        Self { wall_ms, counter }
    }

    pub fn tick(&mut self, now_ms: u64) -> Self {
        if now_ms > self.wall_ms {
            self.wall_ms = now_ms;
            self.counter = 0;
        } else {
            self.counter += 1;
        }
        *self
    }

    pub fn observe(&mut self, other: Hlc, now_ms: u64) -> Self {
        let max_wall = self.wall_ms.max(other.wall_ms).max(now_ms);

        if max_wall == self.wall_ms && max_wall == other.wall_ms {
            self.counter = self.counter.max(other.counter) + 1;
        } else if max_wall == self.wall_ms {
            self.counter += 1;
        } else if max_wall == other.wall_ms {
            self.wall_ms = other.wall_ms;
            self.counter = other.counter + 1;
        } else {
            self.wall_ms = max_wall;
            self.counter = 0;
        }
        *self
    }
}
