//! Retry Decider & Hard Prohibitions (T9.6, T9.7)
//!
//! Ref: MISSION_ENGINE_ARCHITECTURE.md §13.3, IMPLEMENTATION_PLAN.md T9.6, T9.7

use super::classify::FailureClass;

pub fn decide_retry(
    failure_class: FailureClass,
    effect_class: u8,
    risk_band: &str,
    has_idempotency_key: bool,
    current_attempt: u32,
    max_retries: u32,
) -> Result<bool, String> {
    // Hard prohibition 1: Class 3 effect (ARCH §13.3)
    if effect_class >= 3 {
        return Ok(false);
    }
    // Hard prohibition 2: Severe risk band (ARCH §11.4)
    if risk_band == "Severe" {
        return Ok(false);
    }
    // Hard prohibition 3: Missing idempotency key (ARCH §13.3)
    if !has_idempotency_key {
        return Ok(false);
    }
    // Hard prohibition 4: Exhausted retry budget
    if current_attempt >= max_retries {
        return Ok(false);
    }

    match failure_class {
        FailureClass::Transient | FailureClass::Environmental => Ok(true),
        _ => Ok(false),
    }
}
