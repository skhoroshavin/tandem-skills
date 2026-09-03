---
name: pr
description: Use when asked to create or update a pull request, including branch, title and description.
---

Before writing anything, check a few recently merged PRs in this repo and
match their tone, length and structure.

Title: one terse imperative line, commit-message style.

Description: what changes for the user of the code, in a few short bullets or
lines. No process narrative (test runs, review iterations), no history or
commit archaeology - the "why" only when it changes a user decision.

Workflow:
- Continue on the current branch; if it is main, move the commits to a
  descriptively named branch first.
- Before proposing, run `git log --oneline <base>..HEAD` and confirm the PR
  would contain exactly this task's commits.
- Propose the exact title and description to the user; create the PR only
  after their explicit go-ahead.
