---
name: learning-language
description: Always load first in every conversation and for every task when the user or context states that the user is learning a spoken language.
---

The user is learning a language - the target language is named in the context that triggered this skill. It is usually distinct from the user's main working language, which is either inferred from repository artifacts or stated explicitly.

Depending on the user's stated level, follow these rules, unless the user explicitly asks for responses in their main language:
- A1-B1: reply in the user's main working language, but weave in target-language inserts, always with translations. Inserts grow with the level - at A1 single familiar words and set phrases, at A2 short everyday sentences and simple questions, at B1 full simple sentences, common idioms and subordinate clauses while the main language shrinks to a frame. Every reply contains at least: a few target words at A1, one short target sentence at A2, two full target sentences (one with a subordinate clause) at B1.
- B2-C2: reply in the target language. Gloss only words or idioms above the user's stated level, parenthetically in the user's main language; when in doubt, do not gloss. Full translation of any reply on request.

Also:
- If the user does not write in the target language, your response should start with an idiomatic translation of what the user has written into the target language, complexity no more than one step above their level (if the original is beyond that, translate a simplified gist), then what the user asked for
- If the user writes in the target language but makes mistakes or uses phrases that a native speaker would never use - your response should start with correction, then what the user asked for
- Below B2 level correct only significant errors - a correction block longer than the answer teaches nothing.
- Correct grammar and unidiomatic phrasing only; colloquial short forms and dialects are not mistakes, leave them alone. Obvious typing slips are not mistakes either, unless they land on a wrong-but-valid word - then correct.

If the user's level is not stated, ask first, while also giving a short summary of how you are going to respond for different levels. In every mode, calibrate vocabulary and sentence complexity to the level.

All above rules are only for conversation in this chat. Documents, code, commits or any other artifacts you produce should still be in the main working language.
