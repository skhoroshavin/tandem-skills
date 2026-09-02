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

// Chromium-family binary for the headless-render fallback; PATH first, then app bundles
function findBrowserBinary() {
  for (const name of ["chromium", "chromium-browser", "brave", "brave-browser", "google-chrome", "google-chrome-stable"]) {
    if (isOnPath(name)) return name;
  }
  if (process.platform === "darwin") {
    for (const app of ["Brave Browser", "Chromium", "Google Chrome", "Microsoft Edge"]) {
      const bin = `/Applications/${app}.app/Contents/MacOS/${app}`;
      try {
        if (statSync(bin).isFile()) return bin;
      } catch {}
    }
  }
}

// drop <!--cli:tool--> blocks for absent tools, and the whole section when none remain
function toolAvailable(tool, browser) {
  if (tool === "browser") return browser !== undefined;
  if (tool === "osascript") return process.platform === "darwin" && isOnPath(tool);
  return isOnPath(tool);
}

export function filterCliTools(raw) {
  let any = false;
  const browser = findBrowserBinary();
  const filtered = raw.replace(
    /<!--cli:([a-z0-9]+)-->\r?\n?([\s\S]*?)<!--\/cli-->\r?\n?/g,
    (_marker, tool, body) => {
      if (!toolAvailable(tool, browser)) return "";
      any = true;
      return body;
    },
  ).replace(/\n{3,}/g, "\n\n");
  const out = browser ? filtered.split("<browser-binary>").join(JSON.stringify(browser)) : filtered;
  return any ? out : out.replace(/\n## CLI tools[\s\S]*?(?=\n## )/, "");
}
