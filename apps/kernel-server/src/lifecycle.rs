use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ServerState {
    Starting,
    Ready,
    Serving,
    Draining,
    Stopped,
}

#[derive(Debug, Error)]
pub enum LifecycleError {
    #[error("Invalid state transition from {from:?} to {to:?}")]
    InvalidTransition { from: ServerState, to: ServerState },
    #[error("Server is not in Serving state (current state: {0:?})")]
    NotServing(ServerState),
}

pub struct ServerLifecycle {
    current_state: ServerState,
    in_flight_count: usize,
}

impl ServerLifecycle {
    pub fn new() -> Self {
        Self {
            current_state: ServerState::Starting,
            in_flight_count: 0,
        }
    }

    pub fn state(&self) -> ServerState {
        self.current_state
    }

    pub fn is_serving(&self) -> bool {
        self.current_state == ServerState::Serving
    }

    pub fn transition_to(&mut self, target: ServerState) -> Result<(), LifecycleError> {
        let valid = match (self.current_state, target) {
            (ServerState::Starting, ServerState::Ready) => true,
            (ServerState::Starting, ServerState::Stopped) => true,
            (ServerState::Ready, ServerState::Serving) => true,
            (ServerState::Serving, ServerState::Draining) => true,
            (ServerState::Draining, ServerState::Stopped) => self.in_flight_count == 0,
            (ServerState::Serving, ServerState::Stopped) => true,
            _ => false,
        };

        if valid {
            self.current_state = target;
            Ok(())
        } else {
            Err(LifecycleError::InvalidTransition {
                from: self.current_state,
                to: target,
            })
        }
    }

    pub fn increment_in_flight(&mut self) -> Result<(), LifecycleError> {
        if self.current_state != ServerState::Serving {
            return Err(LifecycleError::NotServing(self.current_state));
        }
        self.in_flight_count += 1;
        Ok(())
    }

    pub fn decrement_in_flight(&mut self) {
        if self.in_flight_count > 0 {
            self.in_flight_count -= 1;
        }
        if self.current_state == ServerState::Draining && self.in_flight_count == 0 {
            self.current_state = ServerState::Stopped;
        }
    }

    pub fn active_in_flight(&self) -> usize {
        self.in_flight_count
    }
}
