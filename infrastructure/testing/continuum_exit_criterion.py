#!/usr/bin/env python3
"""
==========================================================================
MILESTONE M30 (CONTINUUM HARDENING & 4.0) MASTER EXIT CRITERION SUITE
==========================================================================
Verifies that:
  1. Scope Freeze Guard Gate holds (0 unauthorized evolution loops or auto-enact paths)
  2. EVO-1 Calibration-Bounded Gate holds (rate-limited, revertible, EffectClass invariant)
  3. EVO-2 Charter-Eval-Gated Gate holds (eval-gated, Principal-confirmed, no Standard relaxation)
  4. EVO-3 Compilation-Propose-Only Gate holds (evidence threshold >=5 Missions, 0 standing grant)
  5. EVO-4 Self-Review-No-Enact Gate holds (assessment-only output, 0 StructureChanged events)
  6. Closed Escalation-Coverage Enumeration Gate holds (all 12 loop x target reachabilities closed)
  7. Second Security Review Red-Team Corpus (E1–E12) passes (all 12 cases refused & surfaced)
  8. Decision-Authorship Invariant holds (loop actors prohibited from escalating Decisions)
  9. Locality Egress Gate holds (0 learning bytes leave machine, ADR-0009)
 10. 90-Day Dogfood Acceptance Harness passes with recorded Release 4.0 Decision (ADR-0078)
"""

import sys
import subprocess

def print_header():
    print("\n" + "=" * 74)
    print("EXECUTING MILESTONE M30 (CONTINUUM HARDENING & 4.0) MASTER EXIT CRITERION SUITE")
    print("=" * 74 + "\n")

def run_script(path, desc):
    print(f"[{desc}] Executing {path}...")
    res = subprocess.run([sys.executable, path], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"  [ERROR] FAILED: {path}")
        print(res.stdout)
        print(res.stderr)
        sys.exit(1)
    else:
        print(f"  - {desc}: PASSED OK")

def main():
    print_header()

    run_script("infrastructure/ci/gates/scope_freeze.py", "Scope-Freeze Guard Gate")
    run_script("infrastructure/ci/gates/evo1_calibration_bounded.py", "EVO-1 Calibration Gate")
    run_script("infrastructure/ci/gates/evo2_charter_eval_gated.py", "EVO-2 Charter Gate")
    run_script("infrastructure/ci/gates/evo3_compilation_propose_only.py", "EVO-3 Compilation Gate")
    run_script("infrastructure/ci/gates/evo4_self_review_no_enact.py", "EVO-4 Self-Review Gate")
    run_script("infrastructure/ci/gates/escalation_coverage.py", "Escalation Coverage Gate")
    run_script("infrastructure/ci/gates/locality_egress.py", "Locality Egress Gate")

    run_script("infrastructure/testing/security/escalation_red_team.py", "Red-Team Corpus E1-E12")
    run_script("infrastructure/testing/security/decision_authorship.py", "Decision-Authorship Invariant")
    run_script("infrastructure/testing/dogfood/acceptance_90days.py", "90-Day Dogfood Acceptance")

    print("\n==========================================================================")
    print("MILESTONE M30 (CONTINUUM HARDENING & 4.0) EXIT CRITERION FULLY SATISFIED!")
    print("RELEASE 4.0 'CONTINUUM' COMPLETE!")
    print("SIDRA OS ARCHITECTURE PROGRAMME COMPLETE THROUGH M30!")
    print("==========================================================================\n")

if __name__ == "__main__":
    main()
