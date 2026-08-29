# AGENTS.md

Prompt/skill distribution repo: `src/` is the source of truth, `packages/` is
build output. Both are committed; keep them in sync via the renderer.

## Layout

- `src/prompt.md`, `src/skills/`, `src/README.md` - templates, placeholders: `{{prompt_prefix}}`, `{{worker_cmd}}`, `{{install}}`
- `src/<harness>/` - per-harness values: `prompt-prefix.md`, `worker-cmd.txt`, `install.md`, `install-label.txt` (root-README annotation); a missing or empty file renders as an empty string (and a missing or empty `install.md` means the package ships no README)
- root `README.md` is rendered from `src/README.md` with all install snippets, each `packages/<harness>-tandem/README.md` with only its own
- `packages/<harness>-tandem/` - rendered output (`prompt.md`, `skills/`, `README.md`, `LICENSE` copied from the root) plus hand-maintained files (`package.json`, `.claude-plugin/`, `extensions/`, `hooks/`)

## Rules

- Never hand-edit rendered files (root `README.md`; `prompt.md`, `skills/`, `README.md`, `LICENSE` under `packages/`); edit `src/` or the root `LICENSE`, then render.

## Commands

```bash
node src/render.mjs          # render src/ -> packages/ and root README.md
```

Rendering requires Node >= 20.12 (`readdirSync` recursive, `Dirent.parentPath`).
