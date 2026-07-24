#!/usr/bin/env bash
# Format only staged files during pre-commit, then re-stage fixes.
# Avoids dirty working tree after commit (e.g. shfmt touching unstaged hook scripts).
set -euo pipefail

msg() {
    printf '[git-hooks] %s\n' "$*"
}

STAGED=()
while IFS= read -r -d '' f; do
    [ -z "$f" ] && continue
    [ ! -f "$f" ] && continue
    STAGED+=("$f")
done < <(git diff --staged --name-only -z --diff-filter=ACMR 2>/dev/null || true)

if [ "${#STAGED[@]}" -eq 0 ]; then
    msg "format staged: nothing to do (no staged files)"
    exit 0
fi

BIOME_FILES=()
SH_FILES=()
for f in "${STAGED[@]}"; do
    case "$f" in
    *.sh) SH_FILES+=("$f") ;;
    *.ts | *.tsx | *.js | *.jsx | *.json | *.md | *.mdx | *.css)
        BIOME_FILES+=("$f")
        ;;
    esac
done

FIXED=0

if [ "${#BIOME_FILES[@]}" -gt 0 ]; then
    if bunx biome format --write "${BIOME_FILES[@]}" >/dev/null 2>&1; then
        for f in "${BIOME_FILES[@]}"; do
            if ! git diff --quiet -- "$f" 2>/dev/null; then
                git add "$f"
                FIXED=$((FIXED + 1))
                msg "biome formatted: $f"
            fi
        done
    else
        msg "format staged: biome skipped (no biome targets or biome unavailable)"
    fi
fi

if [ "${#SH_FILES[@]}" -gt 0 ]; then
    if command -v shfmt >/dev/null 2>&1; then
        shfmt -i 4 -w "${SH_FILES[@]}"
        for f in "${SH_FILES[@]}"; do
            if ! git diff --quiet -- "$f" 2>/dev/null; then
                git add "$f"
                FIXED=$((FIXED + 1))
                msg "shfmt formatted: $f"
            fi
        done
    else
        msg "format staged: shfmt not found, skipping shell files"
    fi
fi

if [ "$FIXED" -eq 0 ]; then
    msg "format staged: OK (${#STAGED[@]} staged file(s), no fixes needed)"
else
    msg "format staged: done ($FIXED file(s) formatted and re-staged)"
fi

exit 0
