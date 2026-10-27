// Emits the CLI tools section (prompt.md), keeping only <!--cli:tool--> blocks
// for tools available in this session; empty string when none are.
import { spawnSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

// windows executables are found via fixed suffixes (.exe etc)
const extensions = process.platform === "win32" ? [".EXE", ".BAT", ".CMD"] : [""];

function isOnPath(binary) {
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
  for (const name of ["chromium", "chromium-browser", "google-chrome", "google-chrome-stable"]) {
    if (isOnPath(name)) return name;
  }
  if (process.platform === "darwin") {
    for (const app of ["Chromium", "Google Chrome"]) {
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
  } catch {}
  return false;
}

function toolAvailable(tool, ctx) {
  if (tool === "browser") return ctx.browser !== undefined;
  if (tool === "html2text") return ctx.html2text;
  if (tool === "lynx") return !ctx.html2text && isOnPath(tool);
  if (tool === "osascript") return process.platform === "darwin" && isOnPath(tool);
  return isOnPath(tool);
}

export function cliToolsSection() {
  const ctx = { browser: findBrowserBinary(), html2text: isPythonHtml2text() };
  let hasTools = false;
  const prompt = readFileSync(join(here, "prompt.md"), "utf8").replace(
    /<!--cli:([a-z0-9]+)-->\r?\n?([\s\S]*?)<!--\/cli-->\r?\n?/g,
    (_marker, tool, body) => {
      if (!toolAvailable(tool, ctx)) return "";
      hasTools = true;
      return body;
    },
  );
  if (!hasTools) return "";
  return prompt
    .replace(/<browser-binary>/g, () => JSON.stringify(ctx.browser))
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
