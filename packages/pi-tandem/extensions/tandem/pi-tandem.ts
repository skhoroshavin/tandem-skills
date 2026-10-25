import { assemblePrompt } from "../../prompt/index.mjs";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const prompt = assemblePrompt();

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
