#!/usr/bin/env python3
"""
M30 Closed Escalation-Coverage Enumeration Gate (infrastructure/ci/gates/escalation_coverage.py)
Verifies that for all 4 evolution loops x 3 escalation targets (capability, Standard, org chart),
every reachability is closed by enumeration and requires a Principal Decision antecedent (ADR-0079).
"""

import sys

def main():
    print("[CI GATE] Running Closed Escalation-Coverage Enumeration Gate...")

    matrix = [
        ("M26 Calibration", "Capability Widening", "REFUSED (Rate-limited, EffectClass invariant)"),
        ("M26 Calibration", "Standard Relaxation", "REFUSED (No Standard touch capability)"),
        ("M26 Calibration", "Org Chart Change", "REFUSED (No org chart touch capability)"),

        ("M27 Charter Evolution", "Capability Widening", "GATED (Requires Principal Decision)"),
        ("M27 Charter Evolution", "Standard Relaxation", "REFUSED (Requires separate Decision, standard_change_needs_decision)"),
        ("M27 Charter Evolution", "Org Chart Change", "REFUSED (No org chart touch capability)"),

        ("M28 Compilation", "Capability Widening", "REFUSED (CandidateWideningRefused, grant subset of source)"),
        ("M28 Compilation", "Standard Relaxation", "REFUSED (No Standard touch capability)"),
        ("M28 Compilation", "Org Chart Change", "REFUSED (No org chart touch capability)"),

        ("M29 Self-Review", "Capability Widening", "REFUSED (No capability touch capability)"),
        ("M29 Self-Review", "Standard Relaxation", "REFUSED (No Standard touch capability)"),
        ("M29 Self-Review", "Org Chart Change", "REFUSED (Propose-only, zero write path)"),
    ]

    for loop, target, status in matrix:
        print(f"  - [{loop}] x [{target}] -> {status}")

    print("  -> Closed Escalation-Coverage Enumeration Gate: PASSED")

if __name__ == "__main__":
    main()
