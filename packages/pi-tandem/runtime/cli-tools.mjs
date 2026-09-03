// Shared runtime helpers, copied verbatim into every package's runtime/ dir.
// Files filtered by this module must contain <!--cli:tool-->...<!--/cli--> blocks.

import { spawnSync } from "node:child_process";
import { statSync } from "node:fs";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const spawnScript = join(
  dirname(fileURLToPath(import.meta.url)),
  process.env.PASEO_AGENT_ID ? "spawn-paseo.sh" : "spawn-tmux.sh",
);

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
function toolAvailable(tool, ctx) {
  if (tool === "browser") return ctx.browser !== undefined;
  if (tool === "html2text") return ctx.html2text;
  if (tool === "lynx") return !ctx.html2text && isOnPath(tool);
  if (tool === "osascript") return process.platform === "darwin" && isOnPath(tool);
  if (tool === "paseo") return !!process.env.PASEO_AGENT_ID;
  if (tool === "tmux") return !process.env.PASEO_AGENT_ID && !!process.env.TMUX;
  return isOnPath(tool);
}

export function filterCliTools(raw) {
  let hasTools = false;
  const ctx = {
    browser: findBrowserBinary(),
    html2text: isPythonHtml2text(),
  };
  const filtered = raw
    .replace(
      /<!--cli:([a-z0-9]+)-->\r?\n?([\s\S]*?)<!--\/cli-->\r?\n?/g,
      (_marker, tool, body) => {
        if (!toolAvailable(tool, ctx)) return "";
        hasTools = true;
        return body;
      },
    )
    .replace(/<browser-binary>/g, () => (ctx.browser ? JSON.stringify(ctx.browser) : "<browser-binary>"))
    .replace(/<spawn-script>/g, () => JSON.stringify(spawnScript))
    .replace(/\n{3,}/g, "\n\n");
  return hasTools ? filtered : filtered.replace(/\n## CLI tools[\s\S]*?(?=\n## )/, "");
}
