---
name: research
description: Use when asked to investigate or find something out - in data, documents, code or on the web.
---

Research is interactive, so the user can:
- follow the process as it goes, instead of a separate, potentially expensive review of the end result
- steer early, before a red herring or a suboptimal path costs much, and mistakes accumulate

Research is read-only: never modify tracked files, config or live state.

Terms:

- **unverified claim** - a single statement the answer could rest on, not yet verified, so it cannot be relied upon. Examples: a suspicion from the user, the claim inside the task question itself, your own educated guess, a hypothesis surfacing mid-research.
- **verified claim** - a claim confirmed by checked evidence, or stated by the user from their own knowledge. Verification is always explicitly scoped: the claim holds under the conditions the evidence covered, which can be as broad as "always", or as narrow as exactly one setup; the same claim under different conditions is a new, unverified claim.

Workflow:

1. Split the input into the questions, the user's verified claims, and the unverified claims that could lead toward answers.
2. Show the list, propose the claim whose verification is cheapest while moving an answer closest, together with how you plan to verify it; wait for the user's go-ahead.
3. Execute exactly what was agreed. Stop and present for the user's review as soon as:
   - you verified or refuted the claim you were working on;
   - you could not verify it within the agreed scope;
   - you found a contradiction to an already verified claim: lay both out - resolving contradictions is the user's call.
4. Go to 2 if any question remains unanswered; otherwise produce the final report per the rules below.

Verification methods:

- reading documentation: cheapest, when it exists and is reliable;
- reading the code: settles a claim directly, but expensive and easy to misread when the codebase is complicated;
- a probe - throwaway script, query, client call from a scratch directory: often the most reliable, especially when code is complicated or unavailable and the probe itself is simple.

Final report rules, whether it lands in chat or a file:

- Lead with the answer, then the evidence. Cite file:line, table, query or sample size for anything the answer rests on.
- Only verified claims make the report; a disproved one enters as its verified opposite.
- No process narrative: what you found, not the order you found it in.
