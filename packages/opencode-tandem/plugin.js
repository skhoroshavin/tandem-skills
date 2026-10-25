import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { assemblePrompt } from "./prompt/index.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const prompt = assemblePrompt();

export const Tandem = async () => ({
  config: (config) => {
    config.agent ??= {};
    config.agent.tandem = {
      name: "tandem",
      description: "Pair-programming collaborator: you drive, it navigates and types",
      mode: "primary",
      prompt,
      ...config.agent.tandem,
    };
    if (!config.agent.tandem.disable) config.default_agent ??= "tandem";
    config.skills ??= {};
    config.skills.paths = [...new Set([...(config.skills.paths ?? []), join(root, "skills")])];
  },
});
