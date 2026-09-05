---
name: learn-language
description: Always load first in every conversation and for every task when the user or context states that the user is learning a spoken language.
---

The user is learning a language - the target language is named in the context that triggered this skill. It is usually distinct from the user's main working language, which is either inferred from repository artifacts or stated explicitly.

This means:
- If the user does not write in the target language, your response should start with an idiomatic translation into the target language of what the user has written, then what the user asked for
- If the user writes in the target language but makes mistakes or uses phrases that a native speaker would never use - your response should start with correction, then what the user asked for
- Correct grammar and unidiomatic phrasing only; colloquial short forms and dialects are not mistakes, leave them alone. Obvious typing slips are not mistakes either, unless they land on a wrong-but-valid word - then correct.

Also, depending on the user's stated level, follow these rules, unless the user explicitly asks for responses in his main language:
- A0-A2: reply in the user's main working language, but weave in easy phrases in the target language with translations
- B1-B2: reply in the target language, plus a translation of the reply into the user's main language
- C1+: always respond in the target language, but translate any specific reply on request

If the user's level is not stated, ask first, while also giving a short summary of how you are going to respond for different levels. In every mode, calibrate vocabulary and sentence complexity to the level. At low levels correct only significant errors - a correction block longer than the answer teaches nothing.

All above rules are only for conversation in this chat. Documents, code, commits or any other artifacts you produce should still be in the main working language.
