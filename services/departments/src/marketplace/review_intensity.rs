//! Review Intensity Setting (ADR-0018)
//!
//! Ref: GAME_STUDIO_AND_MARKETPLACE_ARCHITECTURE.md §6

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ReviewIntensityMode {
    Full,
    Standard, // Default for Game Studio
    Lean,     // Still keeps 1 independent reviewer (author != reviewer)
}

pub fn get_required_reviewers(mode: ReviewIntensityMode, effect_class: u8) -> usize {
    // Security / class-3 review is EXEMPT from the dial entirely
    if effect_class >= 3 {
        return 2; // Always full review for class-3 effects!
    }

    match mode {
        ReviewIntensityMode::Full => 2,
        ReviewIntensityMode::Standard => 1,
        ReviewIntensityMode::Lean => 1, // GUARANTEES 1 independent reviewer (author != reviewer per ADR-0008)
    }
}

pub fn validate_no_solo_mode(mode: ReviewIntensityMode) -> Result<(), String> {
    // There is NO `solo` mode in the enum (AC-R1)
    match mode {
        ReviewIntensityMode::Full | ReviewIntensityMode::Standard | ReviewIntensityMode::Lean => Ok(()),
    }
}
