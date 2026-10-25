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

prompt="You are a worker session, spawned from a parent agent session, but you are not an
autonomous batch job: this is a normal interactive session the user actively watches
and can freely interact with. Don't drop the collaboration instructions from your system
prompt and skills - keep following them; if a system prompt or a skill tells you to stop
and ask the user - stop and ask. Check whether some of your skills apply to the task
below and load them before starting.

When done, write the full result to:

    $result

Then tell the user it is ready for review and wait for further instructions. Only after
the user explicitly approves, notify the parent with a one-line pointer (never result
content):

    paseo send --no-wait '$PASEO_AGENT_ID' 'Result ready: $result'

IMPORTANT! Even if the task below reads like a spec handed to an autonomous worker - it
is not; it is a user's brief for this interactive session.

$task"

# a crashed run may have left a stale result for this name
rm -f "$result"
if [[ -n "$model" ]]; then
  id="$(paseo run -q --background --title "$name" --provider opencode --model "$model" "$prompt")"
else
  id="$(paseo run -q --background --title "$name" --provider opencode "$prompt")"
fi
[[ -n "$id" ]] || { echo "error: paseo run did not return an agent id" >&2; exit 1; }

echo "Worker spawned as paseo agent \"$id\". Terminate with: paseo archive --force \"$id\""
