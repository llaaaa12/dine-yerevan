#!/usr/bin/env bash
# PostToolUse: formats (Prettier) and lints (ESLint --fix) each file Claude edits in backend/ or
# frontend/. Lint errors that --fix can't solve go back to Claude (exit 2).
set -uo pipefail

input=$(cat)
file=$(jq -r '.tool_input.file_path // empty' <<<"$input")
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
[[ -n $file && -f $file ]] || exit 0

case "$file" in
  "$root"/backend/*) app=backend ;;
  "$root"/frontend/*) app=frontend ;;
  *) exit 0 ;;
esac
case "$file" in
  */node_modules/* | */dist/*) exit 0 ;;
esac

cd "$root/$app" || exit 0

case "$file" in
  *.ts | *.tsx | *.js | *.jsx | *.json | *.css | *.md | *.html | *.yaml | *.yml)
    npx --no-install prettier --write --log-level warn "$file" >/dev/null 2>&1
    ;;
esac

case "$file" in
  *.ts | *.tsx | *.js | *.jsx)
    if ! out=$(npx --no-install eslint --fix "$file" 2>&1); then
      printf 'ESLint problems left in %s after --fix. Fix them now:\n%s\n' "${file#"$root"/}" "$out" >&2
      exit 2
    fi
    ;;
esac
exit 0
