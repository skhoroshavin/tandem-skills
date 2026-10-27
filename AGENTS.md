# AGENTS.md

Prompt/skill distribution repo: `src/` is the source of truth, `packages/` is build output. Both are committed; keep them in sync via the renderer.

## Layout

- `src/README.md` - README template, placeholder: `{{install}}`
- `src/system-prompt/` - the system prompt: `index.mjs` assembles it at session start (prefix + prompt + cli tools + subagent + suffix, joined with a blank line, empty parts skipped), md content in sibling `prompt.md` files
- `src/skills/` - skills, rendered to the package root (harnesses discover them there by convention)
- `src/harness/<harness>/` - per-harness source, copied verbatim into the package, except `settings.json` (label, worker commands) and `install.md` (a missing or empty one means the package ships no README), which the renderer consumes as placeholder values; `system-prompt/prefix.md` and `suffix.md` are the optional prompt edges, the rest is plumbing (hooks, extensions, manifests)
- root `README.md` is rendered from `src/README.md` with all install snippets, each `packages/<harness>-tandem/README.md` with only its own
- `packages/<harness>-tandem/` - rendered output; the only files there not owned by the renderer are pi-tandem's `node_modules/` and `package-lock.json`

## Rules

- Never hand-edit rendered files (the root `README.md` and everything under `packages/` except pi-tandem's npm artifacts); edit `src/` or the root `LICENSE`, then render.
- Markdown documents are not hard-wrapped: one paragraph or list item per line, however long; scripts and code blocks keep their own formatting.

## Commands

```bash
node src/render.mjs          # render src/ -> packages/ and root README.md
./preflight.sh               # render + typecheck, before pushing (see CONTRIBUTING.md)
```

First release: bump, tag and publish `pi-tandem` manually, then register the release workflow as trusted publisher on npmjs.com; later releases use the workflow.

Rendering requires Node >= 20.12 (`readdirSync` recursive, `Dirent.parentPath`).
