---
name: code-review
description: Use when asked to do a code review.
---

Read the full diff and everything it touches before judging; the worst review mistakes come from reviewing the diff only. The review is read-only: never modify tracked files, the index, HEAD, or branch state; running builds and tests to verify the change is fine. Load the `coding` skill first and apply it in full when judging the change.

Review as a lazy senior engineer: besides bugs, flag NIH syndrome, overengineering, unnecessary dependencies, obvious copy paste and other similar code bloats. Give accompanying tests the same, if not higher, level of attention: unreadable, overcomplicated tests explain nothing, and a test that would also pass without the change proves nothing.

Report rules:

- Actionable findings only, ordered by severity: ones requiring changes, or at least explicit decisions; "checked and fine" does not qualify.
- Each finding: what is wrong and why it matters in 1-3 lines, then the smallest fix as a concrete diff, or set of diffs; if not diffable, describe generally and ask for a decision.
- No praise, no diff summary, no restating the request, no advice beyond findings.
- If nothing actionable: say exactly that, plus one line on what was checked.
