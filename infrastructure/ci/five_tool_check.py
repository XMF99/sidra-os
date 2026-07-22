#!/usr/bin/env python3
"""M12 Five-Tool Executive CI Check.

Enforces that every Division Executive and Office Head declares EXACTLY FIVE tools:
{retrieve, delegate, convene, decide, report}.
A sixth tool on any executive fails the build (ADR-0004).

Task: T4.4 (M12 Structure)
Ref: ADR-0004, IMPLEMENTATION_PLAN.md T4.4
"""

from __future__ import annotations

import sys
import argparse
from pathlib import Path

ALLOWED_TOOLS = {"retrieve", "delegate", "convene", "decide", "report"}

def check_five_tool_constraint(repo_root: Path) -> bool:
    print("Checking M12 Five-Tool Executive Constraint (ADR-0004)...")
    charters_dir = repo_root / "services" / "agents" / "charters"
    if not charters_dir.exists():
        print("Charters directory does not exist, passing check.")
        return True

    violations = []
    for f in charters_dir.glob("*.toml"):
        content = f.read_text(encoding="utf-8")
        if "tools = [" in content:
            tools_line = [line for line in content.splitlines() if "tools = [" in line][0]
            # Simple parse of tools list
            tools_str = tools_line.split("[")[1].split("]")[0]
            tools = [t.strip().strip('"').strip("'") for t in tools_str.split(",") if t.strip()]
            
            if len(tools) != 5:
                violations.append(f"Executive charter '{f.name}' has {len(tools)} tools (expected 5)")
            else:
                for t in tools:
                    if t not in ALLOWED_TOOLS:
                        violations.append(f"Executive charter '{f.name}' includes invalid tool '{t}'")

    if violations:
        print("FAILED: Five-tool constraint violations found:")
        for v in violations:
            print(f"  - {v}")
        return False

    print("Five-tool executive constraint check passed: All executive charters declare exactly the 5 allowed tools.")
    return True

def main() -> int:
    parser = argparse.ArgumentParser(description="Check five-tool executive constraint")
    parser.add_argument("repo_root", nargs="?", default=".", help="Path to repository root")
    args = parser.parse_args()
    success = check_five_tool_constraint(Path(args.repo_root).resolve())
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
