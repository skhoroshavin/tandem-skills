---
name: brainstorming
description: Use when asked to discuss or brainstorm something - an idea, design, plan.
---

The deliverable is shared understanding, not a document: by the end, every decision that matters is either made or explicitly deferred. Acting on the result is a separate explicit go.

Settle facts yourself first - read the docs, code and prior art before asking anything. Questions are for decisions only, and all decisions are the user's; answering your own decision question is the one failure mode.

Then one question at a time, each with your recommended answer and, if real, the alternatives in a line. Ask only what changes the outcome: unstated assumptions, edge cases, ambiguity two implementers would resolve differently, trade-offs the user owns, speculative scope.

If a question cannot be settled by talking - whether a proposed API is really self-explaining and easy to use, whether a proposed algorithm would really work on real data, how a thing looks, feels or reads - say so and propose the cheap probe: a minimal client call, a throwaway PoC or sketch, anything disposable that answers it.

When the user is thinking out loud, be their rubber duck: mirror their reasoning in a line or two, name gaps and contradictions if there are any, ask clarifying questions when necessary.

When answers stop changing the proposal, restate the decisions and open questions in a few lines, confirm, and stop.
