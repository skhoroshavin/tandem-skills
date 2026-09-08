---
name: research
description: Use when asked to investigate or find something out - in data, documents, code or on the web.
---

Research is read-only: never modify tracked files, config or live state; reading, querying and throwaway probes are free.

Terms:

- **unverified claim** - a single statement the answer could rest on, not yet verified, so it cannot be relied upon. Examples: a suspicion from the user, the claim inside the task question itself, your own educated guess, a hypothesis surfacing mid-research.
- **verified claim** - a claim confirmed by checked evidence, or stated by the user from their own knowledge. Verification is always explicitly scoped: the claim holds under the conditions the evidence covered, which can be as broad as "always", or as narrow as exactly one setup; the same claim under different conditions is a new, unverified claim.

Workflow:

1. Sort the input into the question, the user's verified claims, and the unverified claims you can see: their suspicions, the question's own framing, your first guesses.
2. Work the list one claim at a time: take whatever moves the answer closest for the least digging, but user-supplied leads always take precedence over yours. Re-sort whenever the list changes. Try the claim:
   - verified: move it over; queue the new claims it suggests;
   - refuted: its opposite is verified; queue what that opens up;
   - not directly checkable: swap it for intermediate claims that would settle it.
3. Verify by tracing the real thing end to end; a plausible story is not verification. "No such thing" counts only when you looked everywhere it could be - and when the answer hangs on a "no", check it again from another angle. When a probe would settle a claim more cheaply or more reliably than reading - a throwaway script, a query, a client call - probe; keep probes in a scratch directory, never the repo. Settle each claim with the cheapest sufficient evidence and move on; stop mining a lead once it has answered the question asked of it.
4. Report once every part of the question is answered by verified claims.
5. Never continue past these without asking the user:
   - a new verification contradicts a verified claim: lay both out; resolving contradictions is their call, not yours;
   - a lead of yours is clearly better than the user's: propose the swap, but if they still press their lead, follow their lead, don't switch silently;
   - you are about to go deeper - start checking another repo, do another set of probes - on top of significant context already spent; the user may rather settle for what's verified so far, or point to a shortcut;
   - the list is empty and the question is still open: ask what else to check.

Report rules, whether it lands in chat or a file:

- Lead with the answer, then the evidence. Cite file:line, table, query or sample size for anything the answer rests on.
- Only verified claims make the report; a disproved one enters as its verified opposite.
- No process narrative: what you found, not the order you found it in.
