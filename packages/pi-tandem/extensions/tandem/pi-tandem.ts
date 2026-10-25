import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { filterCliTools } from "../../runtime/cli-tools.mjs";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const prompt = filterCliTools(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../prompt.md"), "utf8"),
);

// drop <!--tool:name--> blocks whose tool is not active in this session
function filterAgentTools(raw: string, active: readonly string[]): string {
  return raw.replace(
    /<!--tool:([a-z0-9]+)-->\r?\n?([\s\S]*?)<!--\/tool-->\r?\n?/g,
    (_marker, tool: string, body: string) => (active.includes(tool) ? body : ""),
  );
}

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", (event) => {
    event.systemPromptOptions.sections.tandem = filterAgentTools(prompt, pi.getActiveTools());
  });
}
