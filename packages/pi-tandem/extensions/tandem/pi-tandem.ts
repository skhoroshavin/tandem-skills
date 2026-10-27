import { assemblePrompt } from "../../system-prompt/index.mjs";
import { filterBlocks } from "../../system-prompt/filter.mjs";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const prompt = assemblePrompt();

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", (event) => {
    // drop <!--tool:name--> blocks whose tool is not active in this session
    const active = pi.getActiveTools();
    event.systemPromptOptions.sections.tandem = filterBlocks(prompt, (tool: string) => active.includes(tool));
  });
}
