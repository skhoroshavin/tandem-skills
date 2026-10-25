// Assembles the final system prompt: prefix + main + cli tools + subagents + suffix.
// Parts are joined with a blank line, empty parts are skipped.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cliToolsSection } from "../cli-tools/index.mjs";
import { subagentsSection } from "../subagents/index.mjs";

const here = dirname(fileURLToPath(import.meta.url));

export function assemblePrompt() {
  const part = (name) => {
    const path = join(here, name);
    return existsSync(path) ? readFileSync(path, "utf8").trim() : "";
  };
  return [part("prefix.md"), part("main.md"), cliToolsSection(), subagentsSection(), part("suffix.md")]
    .filter(Boolean)
    .join("\n\n")
    .concat("\n");
}
