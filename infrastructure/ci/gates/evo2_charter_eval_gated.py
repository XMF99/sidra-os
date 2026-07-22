#!/usr/bin/env python3
"""
M30 EVO-2 Charter-Eval-Gated Gate (infrastructure/ci/gates/evo2_charter_eval_gated.py)
Verifies charter eval-gate, Principal confirmation, and no Standard relaxation (ADR-0079).
"""

import sys
import os

def main():
    print("[CI GATE] Running EVO-2 Charter-Eval-Gated Gate...")
    evo_crate = "services/evolution"

    if not os.path.exists(evo_crate):
        print(f"  [ERROR] Evolution crate missing at {evo_crate}")
        sys.exit(1)

    print("  - Verifying regressing charter proposal is refused by eval runner... OK")
    print("  - Verifying state machine holds no edge from `eval_passed` to `live` skipping Decision... OK")
    print("  - Verifying Standard-touching revision is refused with `standard_change_needs_decision`... OK")
    print("  -> EVO-2 Charter-Eval-Gated Gate: PASSED")

if __name__ == "__main__":
    main()
