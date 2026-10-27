#!/usr/bin/env bash
# Spawn a fresh worker agent session in a new tmux window.
# Usage: spawn-tmux.sh <task-name> [<model>]   (full task on stdin)
set -euo pipefail

name="${1:?usage: spawn-tmux.sh <task-name> [<model>] (full task on stdin)}"
model="${2:-}"
[[ $# -le 2 ]] || { echo "error: unexpected args: $*" >&2; exit 2; }
[[ "$name" =~ ^[a-z0-9][a-z0-9-]{0,30}$ ]] || { echo "error: bad name" >&2; exit 2; }
[[ -n "${TMUX:-}" ]] || { echo "error: not inside tmux" >&2; exit 2; }

task="$(cat)"
[[ -n "$task" ]] || { echo "error: empty task on stdin" >&2; exit 2; }

# resolve via our own pane: display-message without -t resolves to the
# window the user is looking at, not the agent's
parent="$(tmux display-message -p -t "$TMUX_PANE" '#{session_name}:#{window_name}')"
# the name keys the window and the result file: keep it unique among
# live workers
result="/tmp/${name}-result.md"

notify="tmux send-keys -t '$parent' 'Result ready: $result' Enter"
prompt="$(<"$(dirname "$0")/worker-prompt.md")"
prompt=${prompt//<result>/"$result"}
prompt=${prompt//<notify>/"$notify"}
prompt=${prompt//<task>/"$task"} # last, so task text can't retrigger substitutions

# make the prompt safe for the sh -c string tmux runs in the new window
# (must stay unquoted: inside double quotes bash mangles the \' escaping)
prompt=${prompt//\'/\'\\\'\'}

# a crashed run may have left a stale result for this name
rm -f "$result"

# tmux gives the new pane the server's env, not the caller's - forward ours
envargs=()
while IFS= read -r -d '' kv; do
  envargs+=(-e "$kv")
done < <(env -0)

if [[ -n "$model" ]]; then
  tmux new-window "${envargs[@]}" -c "$PWD" -n "$name" "{{worker_cmd_model}}"
else
  tmux new-window "${envargs[@]}" -c "$PWD" -n "$name" "{{worker_cmd}}"
fi
tmux set-option -w -t "$name" automatic-rename off

echo "Worker spawned in tmux window \"$name\". Terminate with: tmux kill-window -t $name"
