#!/usr/bin/env node
import { assemblePrompt } from "../prompt/index.mjs";

process.stdout.write(assemblePrompt());
