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

prompt="$task

# Rules

Check whether you have some skills applicable to this task, and load
them before starting working. This is a normal interactive session:
the user can interact with you here, so ask anything blocking directly
in this chat - don't defer unresolved decisions into the result file.
When done, write the full result to
$result, tell the user it is ready for review and wait for further
instructions. Only after the user explicitly approves, notify the
parent with a one-line pointer (never result content):

    paseo send --no-wait '$PASEO_AGENT_ID' 'Result ready: $result'"

# a crashed run may have left a stale result for this name
rm -f "$result"
if [[ -n "$model" ]]; then
  id="$(paseo run -q --background --title "$name" --provider pi --model "$model" "$prompt")"
else
  id="$(paseo run -q --background --title "$name" --provider pi "$prompt")"
fi
[[ -n "$id" ]] || { echo "error: paseo run did not return an agent id" >&2; exit 1; }

echo "Worker spawned as paseo agent \"$id\". Terminate with: paseo archive --force \"$id\""
