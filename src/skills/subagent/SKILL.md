---
name: subagent
description: Use when explicitly instructed to run a task in a separate or fresh agent session - e.g. "do it in a fresh session", "use a subagent".
---

Spawn a subagent in a new tmux window using the script bundled next to this
file. Pass the full task on stdin, self-contained - the subagent never sees
this session's history:

```bash
<this-skill-dir>/spawn-subagent.sh <task-name> <<'EOF'
<full task>
EOF
```

After spawning, stop and wait: do not poll the worker pane and do not read
the result file early. You will get notified explicitly as a user message
when the result is ready and approved by the actual user; only then read
the file and clean up the window.

If asked to use a specific model, pass it with `--model <model>`:

```bash
<this-skill-dir>/spawn-subagent.sh <task-name> --model <model> <<'EOF'
<full task>
EOF
```

Workers run `{{worker_cmd}}`.
