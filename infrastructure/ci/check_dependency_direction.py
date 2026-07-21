#!/usr/bin/env python3
"""Enforce the Sidra OS crate dependency-direction rules.

Fails the build when a crate depends on a crate it may not depend on. The rules are data
(RULES below), not control flow, so adding one is a reviewable diff rather than a code change.

Introduced by M10 / E1 / T1.1. The rule it enforces is ARCH Appendix B and ADR-0022: the
Mission Engine must not depend on the Orchestrator, because the absence of that edge is what
makes the planning/execution separation a compile-time property.

Two modes:

  metadata  (preferred)  `cargo metadata` is available -> checks DIRECT AND TRANSITIVE deps.
  manifest  (fallback)   no cargo on PATH -> parses Cargo.toml files -> DIRECT deps only.

The fallback is strictly weaker and says so on stderr. CI must run in metadata mode; the
fallback exists so the check is still meaningful on a machine without a toolchain.

Exit codes:
  0  no violation found
  1  violation found
  2  the checker could not run (bad arguments, unreadable workspace, malformed metadata)
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tomllib
from pathlib import Path

# --------------------------------------------------------------------------------------
# Rules
# --------------------------------------------------------------------------------------
# (crate, must_not_depend_on, why)
RULES: list[tuple[str, str, str]] = [
    (
        "sidra-mission",
        "sidra-orchestrator",
        "ADR-0022: the Mission Engine owns plans and must not be able to execute them. "
        "ARCH Appendix B.",
    ),
]

DEP_TABLES = ("dependencies", "dev-dependencies", "build-dependencies")


class CheckerError(Exception):
    """The checker itself could not run. Distinct from a rule violation."""


# --------------------------------------------------------------------------------------
# Mode: cargo metadata (direct + transitive)
# --------------------------------------------------------------------------------------
def dependency_closure_from_metadata(root: Path) -> dict[str, set[str]]:
    """Return {crate: set of all workspace crates it reaches, transitively}."""
    try:
        proc = subprocess.run(
            ["cargo", "metadata", "--format-version", "1", "--all-features"],
            cwd=root,
            capture_output=True,
            text=True,
            check=False,
        )
    except OSError as exc:  # pragma: no cover - environment dependent
        raise CheckerError(f"could not execute cargo: {exc}") from exc

    if proc.returncode != 0:
        raise CheckerError(f"cargo metadata failed:\n{proc.stderr.strip()}")

    try:
        meta = json.loads(proc.stdout)
    except json.JSONDecodeError as exc:
        raise CheckerError(f"cargo metadata returned malformed JSON: {exc}") from exc

    id_to_name = {p["id"]: p["name"] for p in meta.get("packages", [])}
    resolve = meta.get("resolve")
    if not resolve:
        raise CheckerError("cargo metadata contained no dependency resolution")

    direct: dict[str, set[str]] = {}
    for node in resolve.get("nodes", []):
        name = id_to_name.get(node["id"])
        if name is None:
            continue
        direct.setdefault(name, set()).update(
            id_to_name[dep] for dep in node.get("dependencies", []) if dep in id_to_name
        )

    closure: dict[str, set[str]] = {}
    for name in direct:
        seen: set[str] = set()
        stack = list(direct[name])
        while stack:
            current = stack.pop()
            if current in seen:
                continue
            seen.add(current)
            stack.extend(direct.get(current, ()))
        closure[name] = seen
    return closure


# --------------------------------------------------------------------------------------
# Mode: manifest scan (direct only)
# --------------------------------------------------------------------------------------
def workspace_members(root: Path) -> list[Path]:
    manifest = root / "Cargo.toml"
    if not manifest.is_file():
        raise CheckerError(f"no workspace manifest at {manifest}")
    try:
        data = tomllib.loads(manifest.read_text(encoding="utf-8"))
    except (tomllib.TOMLDecodeError, OSError) as exc:
        raise CheckerError(f"could not read {manifest}: {exc}") from exc

    members = data.get("workspace", {}).get("members", [])
    if not members:
        raise CheckerError(f"{manifest} declares no workspace members")

    paths: list[Path] = []
    for entry in members:
        if "*" in entry:
            paths.extend(sorted(p for p in root.glob(entry) if (p / "Cargo.toml").is_file()))
        else:
            candidate = root / entry
            if not (candidate / "Cargo.toml").is_file():
                raise CheckerError(f"workspace member '{entry}' has no Cargo.toml")
            paths.append(candidate)
    return paths


def direct_dependencies_from_manifests(root: Path) -> dict[str, set[str]]:
    """Return {crate: set of directly declared dependency names}."""
    result: dict[str, set[str]] = {}
    for member in workspace_members(root):
        manifest = member / "Cargo.toml"
        try:
            data = tomllib.loads(manifest.read_text(encoding="utf-8"))
        except (tomllib.TOMLDecodeError, OSError) as exc:
            raise CheckerError(f"could not read {manifest}: {exc}") from exc

        name = data.get("package", {}).get("name")
        if not name:
            raise CheckerError(f"{manifest} declares no package name")

        deps: set[str] = set()
        for table in DEP_TABLES:
            deps.update(data.get(table, {}).keys())
        for target in data.get("target", {}).values():
            for table in DEP_TABLES:
                deps.update(target.get(table, {}).keys())
        result[name] = deps
    return result


# --------------------------------------------------------------------------------------
# Entry point
# --------------------------------------------------------------------------------------
def run(root: Path) -> int:
    use_metadata = shutil.which("cargo") is not None

    if use_metadata:
        graph = dependency_closure_from_metadata(root)
        mode, coverage = "metadata", "direct and transitive"
    else:
        graph = direct_dependencies_from_manifests(root)
        mode, coverage = "manifest", "DIRECT ONLY"
        print(
            "warning: cargo not found on PATH; falling back to manifest parsing. "
            "Transitive dependencies are NOT checked. CI must run this with cargo available.",
            file=sys.stderr,
        )

    print(f"dependency-direction check  mode={mode}  coverage={coverage}")

    violations: list[str] = []
    for crate, forbidden, why in RULES:
        if crate not in graph:
            print(f"  skip  {crate} -/-> {forbidden}  (crate not in workspace)")
            continue
        if forbidden in graph[crate]:
            violations.append(
                f"  FAIL  {crate} depends on {forbidden}\n        {why}"
            )
        else:
            print(f"  ok    {crate} -/-> {forbidden}")

    if violations:
        print("\ndependency-direction check FAILED\n", file=sys.stderr)
        for violation in violations:
            print(violation, file=sys.stderr)
        print(
            "\nThis is not a style rule. Remove the dependency; do not suppress the check.",
            file=sys.stderr,
        )
        return 1

    print("dependency-direction check passed")
    return 0


def main(argv: list[str]) -> int:
    if len(argv) > 2:
        print(f"usage: {argv[0]} [workspace-root]", file=sys.stderr)
        return 2
    root = Path(argv[1]).resolve() if len(argv) == 2 else Path.cwd()
    try:
        return run(root)
    except CheckerError as exc:
        print(f"dependency-direction check could not run: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
