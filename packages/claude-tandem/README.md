# Tandem skills

Pair-programming rules for coding agents. A system-prompt patch plus a small set of skills that push back on agentic autonomy and give you control back: fewer unprompted antics, more actual collaboration.

## Install

```bash
claude plugin marketplace add skhoroshavin/tandem-skills
claude plugin install tandem@tandem-skills
```

## Philosophy

Modern coding agents lean toward autonomy: multi-file changes in one go, subagent fan-out, reinforced by the system prompts of popular harnesses (especially Claude Code). The usual result is a bloated clump of code that hopefully works - and reviewing it costs more than generating it saved, since you still have to read all of it. Tandem inverts this: keep changes small enough that each step is cheap to review, and prune misalignment early, before it compounds into slop. The result is both faster and higher-quality.

## What's inside

- **Pair-work prompt patch** - nudges the agent toward:
  - fewer unprompted changes and unwelcome judgment calls
  - more check-ins with you as it goes, so you can follow along and steer early
  - toned-down nauseating sycophancy and "load bearing"-style LLMisms
- **Skills**, each just a short file, loaded on demand:
  - **Research** - verifies claims one at a time, with your go-ahead per step - a red herring or wrong conclusion gets caught while still cheap
  - **Brainstorm** - interviews you about the idea one question at a time, or rubber ducks while you think out loud, until you and the model get on the same page
  - **Coding** - "lazy senior" discipline: no speculative abstractions, deletion over addition, root-cause fixes, self-explanatory code over comment-peppering
  - **Review** - carefully reads whatever you hand it, like docs or code, checks with you on debatable stuff, and then reports actionable findings with a fix each
  - **Pull requests** - matches tone and length of the repo's recently merged PRs, proposes drafts before actually raising or updating a PR
  - **Learn language** - kicks in only if you state that you are learning a language; background practice that stays out of the way of the work
- **Interactive subagents** - fresh-context workers you can steer and must approve; details in the [Interactive subagents](#interactive-subagents) section
- **Tool-specific instructions** (`gh`, `aws`, `jira`, ...) - added only for tools actually installed, so nothing about a missing tool ever ends up in the prompt

## Interactive subagents

In most harnesses a subagent is fire-and-forget: a one-shot call - prompt in, result out, no interaction while it runs - and the full result lands in the parent's context. Tandem keeps the point of the idea - a task runs in a fresh context and reports back, sparing the parent's context the intermediate steps - but drops the fire-and-forget part:

- the worker is a normal agent session with the same skills: you can watch it work and talk to it mid-task
- nothing flows back until you check and approve the result in the worker's chat; only the result - usually far smaller than the worker's full transcript - is loaded into the parent's context

The workflow needs the main session to run inside tmux or paseo. To start a worker, tell the current agent "use a subagent" or "do it in a fresh session": it spawns a new session using the available mechanism - a tmux window, or a parallel paseo agent - and hands it a fully self-contained task; the worker never sees the parent session's history. Workers can spawn subagents of their own, so the delegation nests.

The idea first shipped in [pi-supergsd](https://github.com/skhoroshavin/pi-supergsd), Pi-only, with tasks running as branches in the Pi session tree instead of separate sessions.

## Recommended tools

The plugin notices which CLI tools are actually installed on your machine, and for each one it finds, adds a short note telling the model that the tool is available and recommended to use. Installing these gets you significantly more out of this package:

- `gh` - GitHub CLI: repos, issues, PRs, releases, workflows
- `html2text` (Python, e.g. via `pipx install html2text`) - read web pages as markdown instead of raw markup
- `lynx` - plain-text fallback for web pages when the Python `html2text` is not installed
- `pdftotext` (poppler) - extract text from PDFs
- a Chromium-based browser (Brave, Chromium, Chrome, Edge) - headless-render fallback for JS-heavy or bot-blocked pages
- `pandoc` - convert docx/odt/rtf to markdown
- `osascript` (macOS only) - drive the user's real browser sessions via AppleScript
- `jira`, `aws`, `saml2aws` - if your workflow includes them
- `tmux` or `paseo` - run the main session inside one of these to enable [interactive subagents](#interactive-subagents)

## Attribution

The "lazy senior" part of the coding skill is adapted from [ponytail](https://github.com/DietrichGebert/ponytail) by DietrichGebert (MIT).

The brainstorm skill's interview method (facts vs. decisions, one question at a time, throwaway probes) is inspired by ideas from the brainstorming skill in [superpowers](https://github.com/obra/superpowers) by obra and the grilling skill in [skills](https://github.com/mattpocock/skills) by mattpocock (both MIT).

## License

MIT. See [LICENSE](./LICENSE).
