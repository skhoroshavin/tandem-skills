# AGENTS.md

Prompt/skill distribution repo: `src/` is the source of truth, `packages/` is build output. Both are committed; keep them in sync via the renderer.

## Layout

- `src/README.md` - README template, placeholder: `{{install}}`
- `src/system-prompt/` - the system prompt: `index.mjs` assembles it at session start (prefix + prompt + cli tools + subagent + suffix, joined with a blank line, empty parts skipped), md content in sibling `prompt.md` files
- `src/skills/` - skills, rendered to the package root (harnesses discover them there by convention)
- `src/harness/<harness>/` - per-harness values consumed by the renderer, never copied: `settings.json` (label, worker commands), `install.md` (a missing or empty one means the package ships no README), optional `prefix.md`/`suffix.md` prompt edges
- root `README.md` is rendered from `src/README.md` with all install snippets, each `packages/<harness>-tandem/README.md` with only its own
- `packages/<harness>-tandem/` - hand-maintained harness plumbing (hooks, extensions, manifests) plus render output: `skills/`, `system-prompt/`, `README.md`, `LICENSE`

## Rules

- Never hand-edit rendered files (root `README.md`; `skills/`, `system-prompt/`, `README.md`, `LICENSE` under `packages/`); edit `src/` or the root `LICENSE`, then render - the plumbing under `packages/` is edited where it lives.
- Markdown documents are not hard-wrapped: one paragraph or list item per line, however long; scripts and code blocks keep their own formatting.

## Commands

```bash
node src/render.mjs          # render src/ -> packages/ and root README.md
./preflight.sh               # render + typecheck, before pushing (see CONTRIBUTING.md)
```

First release: bump, tag and publish `pi-tandem` manually, then register the release workflow as trusted publisher on npmjs.com; later releases use the workflow.

Rendering requires Node >= 20.12 (`readdirSync` recursive, `Dirent.parentPath`).
