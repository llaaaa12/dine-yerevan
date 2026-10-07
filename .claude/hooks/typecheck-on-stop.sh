#!/usr/bin/env bash
# Stop: before Claude finishes an answer, typechecks every app whose files changed since its last
# successful check. Errors go back to Claude once; if they remain, the user sees a warning.
set -uo pipefail

input=$(cat)
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
retry=$(jq -r '.stop_hook_active // false' <<<"$input")
state="${TMPDIR:-/tmp}/claude-typecheck-$(printf '%s' "$root" | sha1sum | cut -c1-12)"
mkdir -p "$state"

failed=""
for app in backend frontend; do
  [[ -f $root/$app/package.json ]] || continue
  sig=$(
    {
      git -C "$root" diff HEAD -- "$app"
      git -C "$root" ls-files --others --exclude-standard -- "$app" | while IFS= read -r f; do
        printf '%s\n' "$f"
        cat "$root/$f" 2>/dev/null
      done
    } | sha1sum | cut -d' ' -f1
  )
  [[ $(cat "$state/$app" 2>/dev/null) == "$sig" ]] && continue
  if out=$(cd "$root/$app" && npm run --silent typecheck 2>&1); then
    printf '%s' "$sig" >"$state/$app"
  else
    failed+="--- $app: npm run typecheck ---"$'\n'"$(tail -n 40 <<<"$out")"$'\n'
  fi
done

[[ -z $failed ]] && exit 0
if [[ $retry == true ]]; then
  jq -n --arg m "Typecheck still fails. Run npm run typecheck in the app to see the errors." '{systemMessage: $m}'
  exit 0
fi
printf 'Typecheck failed. Fix these errors before finishing:\n%s' "$failed" >&2
exit 2
