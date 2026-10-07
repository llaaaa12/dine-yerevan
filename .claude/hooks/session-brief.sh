#!/usr/bin/env bash
# SessionStart: a short briefing for Claude (what this prints becomes context):
# branch → roadmap step and its open tasks, uncommitted files, whether the Docker database runs.
set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$root" || exit 0

branch=$(git branch --show-current 2>/dev/null)
step=""
if [[ -n $branch && -f docs/tasks.md ]]; then
  step=$(awk -v tag="\`$branch\`" '
    /^#+ / {
      match($0, /^#+/); lvl = RLENGTH
      if (inside && lvl <= start) exit
      if (!inside && index($0, tag)) {
        inside = 1; start = lvl; title = $0
        sub(/^#+ /, "", title); sub(/ +·.*$/, "", title)
        next
      }
    }
    inside && /^- \[ \] \*\*/ {
      open++
      if (n < 6) { id = $0; sub(/^- \[ \] \*\*/, "", id); sub(/\*\*.*/, "", id); ids = ids (n ? ", " : "") id; n++ }
    }
    inside && /^- \[x\] / { done++ }
    END {
      if (inside) printf "%s: %d open task(s)%s, %d done", title, open, (open ? " (" ids (open > n ? ", …" : "") ")" : ""), done
    }
  ' docs/tasks.md)
fi

echo "Session briefing (.claude/hooks/session-brief.sh):"
echo "- Branch: ${branch:-detached HEAD}${step:+ → $step}"
if [[ -n $branch && -z $step && $branch != main ]]; then
  echo "  (no roadmap step in docs/tasks.md uses this branch name)"
fi
echo "- Uncommitted changes: $(git status --porcelain 2>/dev/null | wc -l | tr -d ' ') file(s)"
if db=$(timeout 5 docker compose ps --format '{{.Service}} {{.State}} {{.Health}}' 2>/dev/null) &&
  grep -q '^db running' <<<"$db"; then
  echo "- Docker database: $(grep '^db' <<<"$db" | cut -d' ' -f2-)"
else
  echo "- Docker database: NOT running (the user starts it with: docker compose up -d)"
fi
echo "- Before the first change, read the rule files that apply (CLAUDE.md → Rules and skills)."
