# Tandem skills

Pair-programming rules for coding agents. A system-prompt patch plus a small set of skills that turn your agent harness from an autonomous code generator into a navigator: you drive, it advises and types, and nothing lands without you seeing it.

## Install

```bash
claude plugin marketplace add skhoroshavin/tandem-skills
claude plugin install tandem@tandem-skills
```

## Philosophy

Modern coding agents lean toward autonomy: multi-file changes in one go, subagent fan-out, reinforced by the system prompts of popular harnesses (especially Claude Code). The usual result is a bloated clump of code that hopefully works - and reviewing it costs more than generating it did, since you still have to read all of it. Tandem inverts this: keep changes small enough that each step is cheap to review, and prune misalignment early, before it compounds into slop. The result is both faster and higher-quality.

## What's inside

- **Pair-work prompt patch** - collaboration style (lock-step, explicit go-aheads), terse communication rules, and a "lazy senior" coding discipline: no speculative abstractions, deletion over addition, root-cause fixes
- **`subagent` skill** to run a task in a fresh agent session on request, with full visibility and control, instead of harness-managed subagents
- **Tool-specific instructions** (`gh`, `aws`, `jira`, ...), added to the prompt only if the tool is actually installed

## Attribution

The "lazy senior" part of the coding section in the prompt is adapted from [ponytail](https://github.com/DietrichGebert/ponytail) by DietrichGebert (MIT).

## License

MIT. See [LICENSE](./LICENSE).
