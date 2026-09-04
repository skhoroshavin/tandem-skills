---
name: review
description: Use when asked to review any kind of artifact, including code, documents and configs.
---

The review is read-only: never modify tracked files, the index, HEAD, or branch state; running builds and tests to verify the change is fine.

Workflow:

1. Read the subject in full and everything it touches before judging; the worst review mistakes come from reviewing the artifact alone.
2. Besides plain errors, flag contradictions, ambiguity, untestable claims, speculative scope and wordy bloat.
3. Ask the user one question at a time about anything you cannot reliably decide yourself from the subject, its surroundings or existing conventions, like:
   - actual need - whether a given edge case really requires a guard, config option or extra explanation, before pushing to add it or flagging its removal
   - competing fixes - two valid solutions with different costs, where the choice is the user's to make
   - preference calls - shorter vs clearer, more detail vs leaner, stricter vs friendlier: ask what matters more before pushing one side
4. Report per the rules below.

When the subject includes code, load the `coding` skill first and apply it in full when judging the subject. Besides bugs, flag NIH syndrome, overengineering, unnecessary dependencies, obvious copy paste and other similar code bloats. Give accompanying tests the same, if not higher, level of attention: unreadable, overcomplicated tests explain nothing, and a test that would also pass without the change proves nothing.

Report rules:

- Actionable findings only, ordered by severity; "checked and fine" does not qualify.
- Each finding includes:
  - what is wrong and why it matters in 1-3 lines
  - the smallest fix as a concrete diff or replacement text; "consider" and "could" are not fixes
- No praise, no summary, no restating the request, no advice beyond findings.
- No questions in the report - they all should have been asked in chat first, one at a time, as part of the workflow.
- If nothing actionable: say exactly that, plus one line on what was checked.
