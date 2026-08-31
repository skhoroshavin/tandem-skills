#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { filterCliTools } from "../runtime/cli-tools.mjs";

const prompt = filterCliTools(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../prompt.md"), "utf8"),
);
process.stdout.write(prompt);
