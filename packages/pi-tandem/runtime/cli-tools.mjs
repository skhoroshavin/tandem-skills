// Shared runtime helpers, copied verbatim into every package's runtime/ dir.
// Files filtered by this module must contain <!--cli:tool-->...<!--/cli--> blocks.

import { spawnSync } from "node:child_process";
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
  for (const name of ["brave", "brave-browser", "chromium", "chromium-browser", "google-chrome", "google-chrome-stable"]) {
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

// brew/apt ship a different C++-based html2text with an incompatible CLI;
// only the Python one supports the --ignore-images flag used in the prompt
function isPythonHtml2text() {
  if (!isOnPath("html2text")) return false;
  try {
    const res = spawnSync("html2text", ["--help"], { encoding: "utf8", timeout: 5000 });
    return res.status === 0 && (res.stdout || "").includes("--ignore-images");
  } catch {
    return false;
  }
}

// drop <!--cli:tool--> blocks for absent tools, and the whole section when none remain
function toolAvailable(tool, browser) {
  if (tool === "browser") return browser !== undefined;
  if (tool === "html2text") return isPythonHtml2text();
  if (tool === "osascript") return process.platform === "darwin" && isOnPath(tool);
  return isOnPath(tool);
}

export function filterCliTools(raw) {
  let hasTools = false;
  const browser = findBrowserBinary();
  const filtered = raw
    .replace(
      /<!--cli:([a-z0-9]+)-->\r?\n?([\s\S]*?)<!--\/cli-->\r?\n?/g,
      (_marker, tool, body) => {
        if (!toolAvailable(tool, browser)) return "";
        hasTools = true;
        return body;
      },
    )
    .replace(/<browser-binary>/g, () => (browser ? JSON.stringify(browser) : "<browser-binary>"))
    .replace(/\n{3,}/g, "\n\n");
  return hasTools ? filtered : filtered.replace(/\n## CLI tools[\s\S]*?(?=\n## )/, "");
}
