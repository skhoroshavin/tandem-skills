// Shared runtime helpers, copied verbatim into every package's runtime/ dir.
// Files filtered by this module must contain <!--cli:tool-->...<!--/cli--> blocks.

import { statSync } from "node:fs";
import { delimiter, join } from "node:path";

// windows executables are found via fixed suffixes (.exe etc)
const extensions = process.platform === "win32" ? [".EXE", ".BAT", ".CMD"] : [""];

export function isOnPath(binary) {
  for (const dir of (process.env.PATH ?? "").split(delimiter)) {
    for (const ext of extensions) {
      try {
        if (statSync(join(dir, binary + ext)).isFile()) return true;
      } catch {}
    }
  }
  return false;
}

// drop <!--cli:tool--> blocks for absent tools, and the whole section when none remain
export function filterCliTools(raw) {
  let any = false;
  const filtered = raw.replace(
    /<!--cli:([a-z0-9]+)-->\n([\s\S]*?)<!--\/cli-->\n?/g,
    (_marker, tool, body) => {
      const available =
        tool === "osascript" ? process.platform === "darwin" && isOnPath(tool) : isOnPath(tool);
      if (!available) return "";
      any = true;
      return body;
    },
  ).replace(/\n{3,}/g, "\n\n");
  return any ? filtered : filtered.replace(/\n## CLI tools[\s\S]*?(?=\n## )/, "");
}
