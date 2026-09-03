# Tandem skills

Pair-programming rules for coding agents. A system-prompt patch plus a small set of skills that turn your agent harness from an autonomous code generator into a navigator: you drive, it advises and types, and nothing lands without you seeing it.

## Install

{{install}}

## Philosophy

Modern coding agents lean toward autonomy: multi-file changes in one go, subagent fan-out, reinforced by the system prompts of popular harnesses (especially Claude Code). The usual result is a bloated clump of code that hopefully works - and reviewing it costs more than generating it did, since you still have to read all of it. Tandem inverts this: keep changes small enough that each step is cheap to review, and prune misalignment early, before it compounds into slop. The result is both faster and higher-quality.

## What's inside

- **Pair-work prompt patch** - collaboration style (lock-step, explicit go-aheads) and terse communication rules
- **Skills**, loaded on demand:
  - **Coding discipline** - a "lazy senior" standard for code changes: no speculative abstractions, deletion over addition, root-cause fixes
  - **Code review** - checks code for bugs and bloat, actionable findings only, proposes the smallest fix
  - **Pull requests** - branch, title and description rules, calibrated to the repo's merged PRs
- **Interactive subagent workflow** to run a task in a fresh session on request (a new tmux window or a background paseo agent), with full visibility and control
- **Tool-specific instructions** (`gh`, `aws`, `jira`, ...), added to the prompt only if the tool is actually installed

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
- `tmux` or `paseo` - run the main session inside one of these to get the interactive subagent workflow

## Attribution

The "lazy senior" part of the coding skill is adapted from [ponytail](https://github.com/DietrichGebert/ponytail) by DietrichGebert (MIT).

## License

MIT. See [LICENSE](./LICENSE).
