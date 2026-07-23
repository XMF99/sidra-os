//! Canonical Brief Comparator (ADR-0041)
//!
//! Compares situation, actions, findings, recommendation, the_ask, confidence
//! octet-for-octet against recorded v1 Brief.

use serde_json::Value;

pub fn compare_canonical_briefs(
    v1_brief_json: &str,
    replayed_brief_json: &str,
) -> Result<(), String> {
    let v1_val: Value = serde_json::from_str(v1_brief_json)
        .map_err(|e| format!("Failed to parse v1 Brief JSON: {e}"))?;
    let rep_val: Value = serde_json::from_str(replayed_brief_json)
        .map_err(|e| format!("Failed to parse replayed Brief JSON: {e}"))?;

    let fields = [
        "situation",
        "actions",
        "findings",
        "recommendation",
        "the_ask",
        "confidence",
    ];
    for f in fields {
        if v1_val.get(f) != rep_val.get(f) {
            return Err(format!(
                "Replay equivalence failure: Field '{f}' differs!\nExpected: {:?}\nActual:   {:?}",
                v1_val.get(f),
                rep_val.get(f)
            ));
        }
    }

    Ok(())
}
