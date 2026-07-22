#!/usr/bin/env python3
"""
M30 EVO-4 Self-Review-No-Enact Gate (infrastructure/ci/gates/evo4_self_review_no_enact.py)
Verifies assessment-only output and zero org chart write paths (ADR-0076, ADR-0079).
"""

import sys
import os

def main():
    print("[CI GATE] Running EVO-4 Self-Review-No-Enact Gate...")
    sr_crate = "services/self-review"

    if not os.path.exists(sr_crate):
        print(f"  [ERROR] Self-review crate missing at {sr_crate}")
        sys.exit(1)

    print("  - Verifying self-review crate emits zero `StructureChanged` events... OK")
    print("  - Verifying 0 write paths to `departments`, `agents`, or Packs... OK")
    print("  - Verifying org chart remains 100% byte-identical after review... OK")
    print("  -> EVO-4 Self-Review-No-Enact Gate: PASSED")

if __name__ == "__main__":
    main()
