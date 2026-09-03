#!/usr/bin/env bash
# Spawn a fresh worker agent session in the background via the local paseo daemon.
# Usage: spawn-paseo.sh <task-name> [--model <model>]   (full task on stdin)
set -euo pipefail

name="${1:?usage: spawn-paseo.sh <task-name> [--model <model>] (full task on stdin)}"
shift
model_flag=""
if [[ "${1:-}" == "--model" ]]; then
  [[ $# -ge 2 ]] || { echo "error: --model needs a value" >&2; exit 2; }
  # plain model ids only: the flag is passed through to paseo run
  [[ "$2" =~ ^[A-Za-z0-9._:/-]+$ ]] || { echo "error: bad model" >&2; exit 2; }
  model_flag="--model $2"
  shift 2
fi
[[ $# -eq 0 ]] || { echo "error: unexpected args: $*" >&2; exit 2; }
[[ "$name" =~ ^[a-z0-9][a-z0-9-]{0,30}$ ]] || { echo "error: bad name" >&2; exit 2; }
[[ -n "${PASEO_AGENT_ID:-}" ]] || { echo "error: not inside a paseo agent session" >&2; exit 2; }

task="$(cat)"
[[ -n "$task" ]] || { echo "error: empty task on stdin" >&2; exit 2; }

# the name keys the result file: keep it unique among live workers
result="/tmp/${name}-result.md"

prompt="$task

# Rules

Check whether you have some skills applicable to this task, and load
them before starting working. When done, write the full result to
$result, tell the user it is ready for review and wait for further
instructions. Only after the user explicitly approves, notify the
parent with a one-line pointer (never result content):

    paseo send --no-wait '$PASEO_AGENT_ID' 'Result ready: $result'"

# paseo run has no default provider: mirror this session's provider/model,
# read from our own agent record (no env vars expose them)
parent="$(paseo inspect --json "$PASEO_AGENT_ID")"
provider="$(printf '%s' "$parent" | node -e 'const a = JSON.parse(require("fs").readFileSync(0, "utf8")); console.log(a.Model ? `${a.Provider}/${a.Model}` : a.Provider)')"
[[ "$provider" =~ ^[A-Za-z0-9._:/-]+$ ]] || { echo "error: could not read provider/model from parent agent" >&2; exit 2; }
if [[ -n "$model_flag" ]]; then
  run_flags="--provider ${provider%%/*} $model_flag"
else
  run_flags="--provider $provider"
fi

# a crashed run may have left a stale result for this name
rm -f "$result"
id="$(paseo run -q --background --title "$name" $run_flags "$prompt")"
[[ -n "$id" ]] || { echo "error: paseo run did not return an agent id" >&2; exit 1; }

echo "Worker spawned as paseo agent \"$id\". Terminate with: paseo archive --force \"$id\""
