---
name: writing
description: Use when drafting or editing text clearly intended for humans outside this conversation, like documentation, issues or articles.
---

Match user style - either from explicitly provided examples, or implicitly from documents being edited - in tone, length and structure.

By default work one paragraph at a time instead of the whole text, unless the user asks for the whole - or the whole text is one paragraph anyway.

For each paragraph:

1. Draft internally, check against the system prompt's Communication section and the style match, sentence by sentence.
2. Present for review.
3. When asked to reformulate some part - word, sentence or the whole paragraph - propose 3 distinct options for it:
   - one that polishes the user's version if there is one
   - two that are fully rewritten from the idea alone - never patch phrases for these
4. After the user accepts the paragraph, go to 1 for the next one.
