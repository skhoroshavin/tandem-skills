#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { filterCliTools } from "../runtime/cli-tools.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const templatePath = join(__dirname, "../prompt.md");

try {
  // Read and filter standard prompt
  const rawPrompt = readFileSync(templatePath, "utf8");
  const filteredPrompt = filterCliTools(rawPrompt);

  // Build the SessionStart output payload with filtered prompt inside additionalContext
  const payload = {
    systemMessage: "🚀 Tandem pair-programming skills and prompt loaded successfully.",
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: filteredPrompt
    }
  };

  // Log only JSON to stdout
  process.stdout.write(JSON.stringify(payload));
} catch (err) {
  console.error("❌ Error in tandem hook injection:", err);
  process.exit(1);
}
process.exit(0);
