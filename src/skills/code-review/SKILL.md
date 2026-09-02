---
name: code-review
description: Use when asked to do a code review.
---

Read the full diff and everything it touches before judging; the worst review
mistakes come from reviewing the diff only.

Report rules:

- Actionable findings only, ordered by severity: ones requiring changes, or
  at least explicit decisions; "checked and fine" does not qualify.
- Each finding: what is wrong and why it matters in 1-3 lines, then the
  smallest fix - as a diff if it fits within 50 LoC, otherwise described
  generally, asking for a decision.
- No praise, no diff summary, no restating the request, no advice beyond
  findings.
- If nothing actionable: say exactly that, plus one line on what was checked.
- Before writing, verify: grep for references to removed or renamed
  identifiers; where the repo has rendered build output, check it is in sync;
  diff the commit message claims against the actual change.
