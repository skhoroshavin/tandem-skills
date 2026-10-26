# Contributing

If your change is a typo or an obvious fix, just open a PR. If it adds something significant - a skill, a harness, real logic - better to open an issue instead, to discuss potential implementation and alternatives.

Main rule: you must understand what you submit. Using AI is fine. Submitting something you can't explain yourself is not.

And CI must pass, of course.

## Design rules

- Prompts should be short and human readable. Rule of thumb: if you can read and understand a skill without too much cognitive effort - it is a good skill.
- Be suspicious of LLM suggestions for these files. For every proposed addition, ask: can a single new sentence carry it? Can modifying an existing sentence carry it? Is it needed at all?
- Placement: needed every session -> the prompt, needed sometimes -> a skill.
- Skills come in two tiers: -ing-named disciplines (`coding`, `writing`) hold reusable background judgment; task skills (`brainstorm`, `review`, `pr`) tackle one concrete job and load disciplines when needed.

## Dev loop

Edit content in `src/` - the prompt, the skills, the harness plumbing; everything under `packages/` is rendered from it. Then run `./preflight.sh`: it renders the changes into `packages/` and typechecks. Commit both sides together; CI rejects the PR if `packages/` is out of sync with `src/`. Never hand-edit rendered files - the next render overwrites them anyway. Layout details: AGENTS.md.
