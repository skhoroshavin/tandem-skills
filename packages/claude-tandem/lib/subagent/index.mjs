// Picks the subagent transport available in this session (paseo inside a paseo
// agent, tmux inside tmux) and emits its prompt section; empty string without one.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export const spawnScript = join(
  here,
  process.env.PASEO_AGENT_ID ? "spawn-paseo.sh" : "spawn-tmux.sh",
);

export function subagentSection() {
  const transport = process.env.PASEO_AGENT_ID ? "paseo.md" : process.env.TMUX ? "tmux.md" : null;
  if (!transport) return "";
  const read = (name) => readFileSync(join(here, name), "utf8").trim();
  return [read("common.md"), read(transport)]
    .join("\n")
    .replace(/<spawn-script>/g, () => JSON.stringify(spawnScript));
}
