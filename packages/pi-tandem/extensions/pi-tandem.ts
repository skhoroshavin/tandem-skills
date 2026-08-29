import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const prompt = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../prompt.md"),
  "utf8",
);

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", async (event) => ({
    systemPrompt: `${event.systemPrompt}\n\n${prompt}`,
  }));
}
