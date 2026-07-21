#!/usr/bin/env bash
# Self-test for infrastructure/ci/check_dependency_direction.py  (M10 / E1 / T1.1)
#
# T1.1's acceptance criterion is "CI fails on any dependency from sidra-mission ->
# sidra-orchestrator". Asserting that the current repository is clean does not test that:
# an empty crate passes trivially. These cases prove the checker REJECTS violations, which
# is the property that will still matter in six months.
#
# Runs without a Rust toolchain: exercises the manifest-scan fallback, which is the mode
# available here. The metadata mode shares the same rule table and reporting path.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHECKER="${SCRIPT_DIR}/../check_dependency_direction.py"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

PASS=0
FAIL=0

report() { # name expected actual
    if [[ "$2" == "$3" ]]; then
        printf '  ok    %-52s exit=%s\n' "$1" "$3"
        PASS=$((PASS + 1))
    else
        printf '  FAIL  %-52s expected=%s actual=%s\n' "$1" "$2" "$3"
        FAIL=$((FAIL + 1))
    fi
}

# fixture <dir> <extra-toml-for-mission-crate>
fixture() {
    local dir="$1" extra="${2-}"
    mkdir -p "${dir}/services/mission/src"
    cat > "${dir}/Cargo.toml" <<'EOF'
[workspace]
resolver = "2"
members = ["services/mission"]
EOF
    cat > "${dir}/services/mission/Cargo.toml" <<EOF
[package]
name = "sidra-mission"
version = "0.1.0"
edition = "2021"
${extra}
EOF
    : > "${dir}/services/mission/src/lib.rs"
}

TMP="$(mktemp -d)"
trap 'rm -rf "${TMP}"' EXIT

echo "dependency-direction checker self-test"
echo

# 1 — clean workspace passes
fixture "${TMP}/clean" '[dependencies]'
python3 "${CHECKER}" "${TMP}/clean" >/dev/null 2>&1
report "clean workspace passes" 0 $?

# 2 — the violation T1.1 exists to catch
fixture "${TMP}/violation" '[dependencies]
sidra-orchestrator = { path = "../orchestrator" }'
python3 "${CHECKER}" "${TMP}/violation" >/dev/null 2>&1
report "direct dependency is rejected" 1 $?

# 3 — dev-dependencies are not an exemption
fixture "${TMP}/devdep" '[dev-dependencies]
sidra-orchestrator = { path = "../orchestrator" }'
python3 "${CHECKER}" "${TMP}/devdep" >/dev/null 2>&1
report "dev-dependency is rejected" 1 $?

# 4 — build-dependencies are not an exemption
fixture "${TMP}/builddep" '[build-dependencies]
sidra-orchestrator = { path = "../orchestrator" }'
python3 "${CHECKER}" "${TMP}/builddep" >/dev/null 2>&1
report "build-dependency is rejected" 1 $?

# 5 — target-specific dependencies are not a way around the rule
fixture "${TMP}/targetdep" '[target."cfg(unix)".dependencies]
sidra-orchestrator = { path = "../orchestrator" }'
python3 "${CHECKER}" "${TMP}/targetdep" >/dev/null 2>&1
report "target-specific dependency is rejected" 1 $?

# 6 — an unrelated dependency is not a false positive
fixture "${TMP}/unrelated" '[dependencies]
sidra-store = { path = "../store" }'
python3 "${CHECKER}" "${TMP}/unrelated" >/dev/null 2>&1
report "unrelated dependency is not a false positive" 0 $?

# 7 — a broken workspace reports "could not run", not "passed"
mkdir -p "${TMP}/broken"
printf '[workspace]\nmembers = ["services/absent"]\n' > "${TMP}/broken/Cargo.toml"
python3 "${CHECKER}" "${TMP}/broken" >/dev/null 2>&1
report "missing member reports checker error" 2 $?

# 8 — no workspace manifest at all
mkdir -p "${TMP}/empty"
python3 "${CHECKER}" "${TMP}/empty" >/dev/null 2>&1
report "absent manifest reports checker error" 2 $?

# 9 — the real repository is clean
python3 "${CHECKER}" "${REPO_ROOT}" >/dev/null 2>&1
report "this repository passes" 0 $?

echo
echo "  ${PASS} passed, ${FAIL} failed"
[[ "${FAIL}" -eq 0 ]]
