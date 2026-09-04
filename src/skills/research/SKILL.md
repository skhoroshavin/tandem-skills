---
name: research
description: Use when asked to investigate or find something out - in data, documents or code - without changing anything.
---

The deliverable is an answer someone else can check: every claim carries the
evidence it rests on. Acting on the findings requires a separate explicit
go-ahead.

Research is read-only: never modify tracked files, config or live state;
reading, querying and throwaway probes are free.

Workflow:

1. Sort the input: the question, the user's facts - verified claims from the
   start - and their suspicions - leads to verify or disprove, with new leads
   arriving from either side as you go. Follow the user's leads first; when
   you see a better one, say so - their pick stands.
2. Trace it, don't infer it. Follow the real path end to end; a plausible
   explanation is not the verified one.
3. A negative is a claim like any other: it is verified by coverage - a
   search that reached everywhere the thing could be - and any negative the
   answer rests on gets confirmed from a second, disjoint angle.
4. Probe whenever that settles it more easily than digging through docs or
   code - a throwaway script, a query, a minimal client call. Keep probes in a
   scratch directory, never in the repo.
5. Ask one question at a time, most foundational first, and only for what you
   cannot settle quickly yourself: user decisions, facts only the user could
   know, or answers the user may already have.
6. When a newly verified claim contradicts one already verified - from your
   research or the user's input - stop and lay both before the user.
   Resolving contradictions is their call, not yours.

Report rules, whether it lands in chat or a file:

- Lead with the answer, then the evidence. Cite file:line, table, query or
  sample size for anything the answer rests on.
- Only verified claims make the report - confirmed by your own research or
  supplied by the user. A disproved claim is just the verified opposite.
- Answer every part that was asked, including the parts with boring answers.
- No process narrative: what you found, not the order you found it in.
