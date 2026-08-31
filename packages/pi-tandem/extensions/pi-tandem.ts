import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { filterCliTools } from "../runtime/cli-tools.mjs";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const prompt = filterCliTools(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../prompt.md"), "utf8"),
);

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", async (event) => {
    const marker = "\n\n<project_context>\n\n";
    const idx = event.systemPrompt.indexOf(marker);
    return {
      systemPrompt:
        idx === -1
          ? `${event.systemPrompt}\n\n${prompt}`
          : event.systemPrompt.slice(0, idx) + `\n\n${prompt}` + event.systemPrompt.slice(idx),
    };
  });
}
