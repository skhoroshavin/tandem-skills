#!/usr/bin/env node
import { assemblePrompt } from "../lib/prompt/index.mjs";

process.stdout.write(assemblePrompt());
