// Emits the subagent section for the method available in this session (paseo
// inside a paseo agent, tmux inside tmux); empty string without one.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

export const spawnScript = join(
  here,
  process.env.PASEO_AGENT_ID ? "spawn-paseo.sh" : "spawn-tmux.sh",
);

export function subagentSection() {
  const method = process.env.PASEO_AGENT_ID ? "paseo" : process.env.TMUX ? "tmux" : null;
  if (!method) return "";
  return readFileSync(join(here, "prompt.md"), "utf8")
    .replace(/<!--method:([a-z]+)-->\r?\n?([\s\S]*?)<!--\/method-->\r?\n?/g, (_m, name, body) =>
      name === method ? body : "",
    )
    .replace(/<spawn-script>/g, () => JSON.stringify(spawnScript))
    .trim();
}
