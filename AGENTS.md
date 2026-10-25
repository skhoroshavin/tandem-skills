# AGENTS.md

Prompt/skill distribution repo: `src/` is the source of truth, `packages/` is build output. Both are committed; keep them in sync via the renderer.

## Layout

- `src/README.md` - README template, placeholder: `{{install}}`
- `src/prompt/`, `src/cli-tools/`, `src/subagents/`, `src/skills/` - shared modules (md content plus `index.mjs` loaders where a module is assembled at session start), rendered into every package: `skills/` to the package root (harnesses discover it there by convention), the rest under `lib/`; subagents files use `{{harness}}`, `{{worker_cmd}}`, `{{worker_cmd_model}}`
- `src/<harness>/` - per-harness values: `install.md` (a missing or empty one means the package ships no README), `worker-cmd*.txt`, and `prefix.md`/`suffix.md` which land next to `lib/prompt/main.md` in the package; a missing or empty file is an empty string
- the system prompt is assembled at session start by `lib/prompt/index.mjs`: prefix + main + cli tools + subagents + suffix, joined with a blank line, empty parts skipped
- root `README.md` is rendered from `src/README.md` with all install snippets, each `packages/<harness>-tandem/README.md` with only its own
- `packages/<harness>-tandem/` - rendered output (`skills/`, `lib/`, `README.md`, `LICENSE` copied from the root) plus hand-maintained files

## Rules

- Never hand-edit rendered files (root `README.md`; `skills/`, `lib/`, `README.md`, `LICENSE` under `packages/`); edit `src/` or the root `LICENSE`, then render.
- Markdown documents are not hard-wrapped: one paragraph or list item per line, however long; scripts and code blocks keep their own formatting.

## Commands

```bash
node src/render.mjs          # render src/ -> packages/ and root README.md
./preflight.sh               # render + typecheck, before pushing (see CONTRIBUTING.md)
```

First release: bump, tag and publish `pi-tandem` manually, then register the release workflow as trusted publisher on npmjs.com; later releases use the workflow.

Rendering requires Node >= 20.12 (`readdirSync` recursive, `Dirent.parentPath`).
