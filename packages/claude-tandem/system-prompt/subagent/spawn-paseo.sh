#!/usr/bin/env bash
# Spawn a fresh worker agent session in the background via the local paseo daemon.
# Usage: spawn-paseo.sh <task-name> [<model>]   (full task on stdin)
set -euo pipefail

name="${1:?usage: spawn-paseo.sh <task-name> [<model>] (full task on stdin)}"
model="${2:-}"
[[ $# -le 2 ]] || { echo "error: unexpected args: $*" >&2; exit 2; }
[[ "$name" =~ ^[a-z0-9][a-z0-9-]{0,30}$ ]] || { echo "error: bad name" >&2; exit 2; }
[[ -n "${PASEO_AGENT_ID:-}" ]] || { echo "error: not inside a paseo agent session" >&2; exit 2; }

task="$(cat)"
[[ -n "$task" ]] || { echo "error: empty task on stdin" >&2; exit 2; }

# the name keys the result file: keep it unique among live workers
result="/tmp/${name}-result.md"

notify="paseo send --no-wait '$PASEO_AGENT_ID' 'Result ready: $result'"
prompt="$(<"$(dirname "$0")/worker-prompt.md")"
prompt=${prompt//<result>/"$result"}
prompt=${prompt//<notify>/"$notify"}
prompt=${prompt//<task>/"$task"} # last, so task text can't retrigger substitutions

# a crashed run may have left a stale result for this name
rm -f "$result"
if [[ -n "$model" ]]; then
  id="$(paseo run -q --background --title "$name" --provider claude --model "$model" "$prompt")"
else
  id="$(paseo run -q --background --title "$name" --provider claude "$prompt")"
fi
[[ -n "$id" ]] || { echo "error: paseo run did not return an agent id" >&2; exit 1; }

echo "Worker spawned as paseo agent \"$id\". Terminate with: paseo archive --force \"$id\""
