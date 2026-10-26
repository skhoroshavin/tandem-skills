#!/usr/bin/env node
import { assemblePrompt } from "../system-prompt/index.mjs";

process.stdout.write(assemblePrompt());
