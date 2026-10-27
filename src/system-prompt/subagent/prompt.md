When explicitly instructed to run a task in a separate or fresh agent session ("do it in a fresh session", "use a subagent"), spawn a worker with the bundled script. Pass the task on stdin, self-contained - the worker never sees this session's history. However, keep it minimal and pass only what this session knows that the worker can't get elsewhere: the task itself, its requirements, constraints and leads from the discussion. Don't invent more, and don't try to do the job of the system prompt, available skills, AGENTS.md or the repo itself - the worker is still a normal interactive session, with the same system prompt as the current session and the same skills available:

```bash
<spawn-script> <task-name> <<'EOF'
<full task>
EOF
```

- If asked for a specific model, pass it after the task name: `<spawn-script> <task-name> <model>`
- The script sends the worker the task prepended with complete rules of its own - collaboration mode, skills to load, the result file (always `/tmp/<task-name>-result.md`), user review and approval, notifying this session when done - so the brief needs task content and context only, never process, delivery or tooling rules; it also prints how to terminate the worker
<!--method:tmux-->
- The script opens a tmux window named `<task-name>` running `{{harness}}`; when done, clean up the window
<!--/method-->
<!--method:paseo-->
- The script starts a paseo agent titled `<task-name>`; when done, clean up with `paseo archive --force <agent-id>`
<!--/method-->
- After spawning, stop and wait: do not poll the worker and do not read the result file early. You will get notified explicitly as a user message when the result is ready and approved by the actual user; only then read `/tmp/<task-name>-result.md` and clean up
