#!/usr/bin/env bash
# PreToolUse: blocks git commands that change the repo, .env files, committed migrations and
# hand edits of generated files; asks before deleting Docker data or changing the dev database.
set -uo pipefail

input=$(cat)
tool=$(jq -r '.tool_name // empty' <<<"$input")
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"

decide() {
  jq -n --arg d "$1" --arg r "$2" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: $d, permissionDecisionReason: $r}}'
  exit 0
}

is_env_file() {
  local base
  base=$(basename "$1")
  [[ $base == .env || ($base == .env.* && $base != .env.example) ]]
}

case "$tool" in
  Read | Edit | Write | MultiEdit | NotebookEdit)
    file=$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' <<<"$input")
    [[ -n $file ]] || exit 0
    if is_env_file "$file"; then
      decide deny "$(basename "$file") holds secrets: don't read or edit it. Tell the user which variable to add, and keep .env.example up to date instead."
    fi
    [[ $tool == Read ]] && exit 0
    case "$file" in
      */node_modules/* | */dist/*)
        decide deny "Don't edit generated files in node_modules/ or dist/."
        ;;
      */package-lock.json)
        decide deny "package-lock.json changes only through npm install (ask the user before installing anything)."
        ;;
      "$root"/backend/src/db/migrations/*)
        rel=${file#"$root"/}
        if git -C "$root" ls-files --error-unmatch -- "$rel" >/dev/null 2>&1; then
          decide deny "$rel is already committed. Never edit a committed migration: create a new one with npm run migration:generate."
        fi
        ;;
    esac
    ;;

  Bash)
    cmd=$(jq -r '.tool_input.command // empty' <<<"$input")
    start='(^|[;&|({`]|\$\(|[[:space:]])'
    git_opts='([[:space:]]+(-C|-c)[[:space:]]+[^[:space:]]+|[[:space:]]+--[a-z-]+(=[^[:space:]]+)?)*'
    git_writes='(add|commit|push|pull|merge|rebase|reset|revert|cherry-pick|checkout|switch|restore|stash|clean|tag|rm|mv|am|apply)'
    if grep -Eq "${start}git${git_opts}[[:space:]]+${git_writes}([[:space:]]|$)" <<<"$cmd" ||
      grep -Eq "${start}git${git_opts}[[:space:]]+branch[[:space:]]+(-[dDmMcCf]|--delete|--move|--copy|--force)" <<<"$cmd"; then
      decide deny "The user runs git commands that change the repository. Give them the exact command(s) with a one-line explanation instead."
    fi
    if grep -Eq "(^|[[:space:]/='\"])\.env(\.(local|production|development|test)|\.[a-z]+\.local)?([[:space:]'\";|&)]|$)" <<<"$cmd" &&
      grep -Eq "${start}(cat|less|more|head|tail|grep|egrep|rg|sed|awk|cut|sort|strings|xxd|od|base64|source|cp|mv|scp|nano|vi|vim|tee|echo|printf)[[:space:]]" <<<"$cmd"; then
      decide deny "This command touches a .env file, which holds secrets. Don't read, copy or change .env files; tell the user what to do instead."
    fi
    if grep -Eq 'docker[[:space:]]+(compose[[:space:]]+down[[:space:]].*(-v([[:space:]]|$)|--volumes)|volume[[:space:]]+(rm|prune)|system[[:space:]]+prune)' <<<"$cmd"; then
      decide ask "This deletes Docker data (the database volume with all its rows). Explain to the user what will be lost before running it."
    fi
    if grep -q 'migration:revert' <<<"$cmd" && ! grep -q 'DB_NAME=dine_yerevan_test' <<<"$cmd"; then
      decide ask "migration:revert undoes the last migration on the development database and can drop tables with their data."
    fi
    if grep -q 'psql' <<<"$cmd" && ! grep -q 'dine_yerevan_test' <<<"$cmd" &&
      grep -Eiq '(^|[^a-z_])(drop|truncate|delete|update|insert|alter|create|grant|revoke)([^a-z_]|$)' <<<"$cmd"; then
      decide ask "This SQL can change the development database. Explain what it changes before running it."
    fi
    ;;
esac
exit 0
