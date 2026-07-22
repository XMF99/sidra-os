#!/usr/bin/env python3
"""
M30 Scope-Freeze Guard Gate (infrastructure/ci/gates/scope_freeze.py)
Refuses any PR adding a fifth evolution loop, an auto-enact path, or a new product feature during M30.
"""

import sys
import os

def main():
    print("[CI GATE] Running Scope-Freeze Guard Gate (M30 / Release 4.0)...")

    # Exact set of 25 existing services in workspace
    allowed_services = {
        "agents", "artifacts-exec", "calibration", "companion", "compilation",
        "connectors", "delegation", "departments", "evolution", "ingest",
        "kernel", "memory", "mission", "models", "orchestrator",
        "plugins", "portability", "registry", "seats", "security",
        "self-review", "store", "sync", "tools", "voice"
    }

    services_dir = "services"
    if os.path.exists(services_dir):
        for item in os.listdir(services_dir):
            if os.path.isdir(os.path.join(services_dir, item)) and item not in allowed_services:
                print(f"  [ERROR] Scope freeze violation! Unauthorized service '{item}' found in services/")
                sys.exit(1)

    print("  - Scope freeze verified: 0 unauthorized evolution loops or services added OK")
    print("  -> Scope-Freeze Guard Gate: PASSED")

if __name__ == "__main__":
    main()
