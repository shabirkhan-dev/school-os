#!/usr/bin/env bash
# Enforce Conventional Commits: type(scope)?: subject
# Allowed types: feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert
# Entire subject line must be lowercase (no uppercase letters).
# Also allow: Merge / Revert / fixup! / squash!
set -euo pipefail

msg() {
    printf '[git-hooks] %s\n' "$*"
}

MSG_FILE="${1:-.git/COMMIT_EDITMSG}"
if [ ! -f "$MSG_FILE" ]; then
    msg "commit-msg: no message file, skipping"
    exit 0
fi

FIRST=$(head -n1 "$MSG_FILE" | tr -d '\r')
MIN_LEN="${COMMIT_MSG_MIN_LEN:-10}"
MAX_LEN="${COMMIT_MSG_MAX_LEN:-200}"

case "$FIRST" in
Merge\ *)
    msg "commit-msg: OK (merge commit message allowed)"
    exit 0
    ;;
Revert\ *)
    msg "commit-msg: OK (revert message allowed)"
    exit 0
    ;;
fixup!*)
    msg "commit-msg: OK (fixup allowed)"
    exit 0
    ;;
squash!*)
    msg "commit-msg: OK (squash allowed)"
    exit 0
    ;;
esac

if [[ "$FIRST" =~ ^# ]]; then
    msg "commit-msg: error - first line looks like a comment; write a real subject line"
    exit 1
fi

if [[ "$FIRST" =~ ^wip([[:space:]:]|$) ]]; then
    msg "commit-msg: error - wip commits are not allowed"
    msg "example: feat(web): add nest-backed login form"
    exit 1
fi

# Reject any uppercase letter in the subject line
if [[ "$FIRST" =~ [A-Z] ]]; then
    msg "commit-msg: error - subject must be all lowercase (no uppercase letters)"
    msg "example: feat(auth): add nestjs login and shared ui forms"
    exit 1
fi

# Conventional Commits: type(optional-scope)!(optional): subject
# Scope and description are lowercase-only (enforced above + charset here)
CONV_RE='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9/_.,-]+\))?(!)?:[[:space:]].+'

if ! [[ "$FIRST" =~ $CONV_RE ]]; then
    msg "commit-msg: error - subject must use conventional commits"
    msg "format:   <type>(optional-scope): <description>"
    msg "types:    feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert"
    msg "example:  feat(auth): add nestjs login and shared ui forms"
    exit 1
fi

LEN=${#FIRST}
if [ "$LEN" -lt "$MIN_LEN" ]; then
    msg "commit-msg: error - first line too short (got ${LEN} chars, min ${MIN_LEN})"
    exit 1
fi

if [ "$LEN" -gt "$MAX_LEN" ]; then
    msg "commit-msg: error - first line too long (got ${LEN} chars, max ${MAX_LEN})"
    exit 1
fi

msg "commit-msg: OK (conventional lowercase commit, length ${LEN})"
exit 0
