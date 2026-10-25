#!/usr/bin/env node
// Renders src/ into packages/<harness>-tandem/ and the root README.md
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, chmodSync, rmSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(repo, "src");

function loadValues(harnessDir, harness) {
  const value = (name) => {
    const path = join(harnessDir, name);
    return existsSync(path) ? readFileSync(path, "utf8").trimEnd() : "";
  };
  return {
    harness,
    worker_cmd: value("worker-cmd.txt"),
    worker_cmd_model: value("worker-cmd-model.txt"),
    install: value("install.md"),
    install_label: value("install-label.txt"),
    prefix: value("prefix.md"),
    suffix: value("suffix.md"),
  };
}

function render(text, values, where) {
  const out = text.replace(/{{([a-z_]+)}}/g, (match, key) => {
    if (!(key in values)) throw new Error(`${where}: unresolved placeholder: ${match}`);
    return values[key];
  });
  const leftover = out.match(/{{[^}]*}}/);
  if (leftover) throw new Error(`${where}: unresolved placeholder: ${leftover[0]}`);
  return out;
}

const listTree = (dir) =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => join(e.parentPath, e.name));

const readmeTemplate = readFileSync(join(src, "README.md"), "utf8");
const licenseText = readFileSync(join(repo, "LICENSE"), "utf8");
// skills/ lands at the package root (harnesses discover it there by convention), the other modules under lib/
const moduleDirs = { "cli-tools": "lib/cli-tools", prompt: "lib/prompt", skills: "skills", subagent: "lib/subagent" };
const moduleFiles = Object.entries(moduleDirs).flatMap(([dir, dest]) =>
  listTree(join(src, dir)).map((file) => [file, join(dest, relative(join(src, dir), file))]),
);
const execFiles = new Set(moduleFiles.map(([file]) => file).filter((f) => statSync(f).mode & 0o111));
for (const [file] of moduleFiles) {
  if (!file.endsWith(".md")) continue;
  const text = readFileSync(file, "utf8");
  const openers = (text.match(/<!--cli:/g) || []).length;
  const closers = (text.match(/<!--\/cli-->/g) || []).length;
  if (openers !== closers) {
    throw new Error(`${relative(src, file)}: unbalanced cli markers: ${openers} openers, ${closers} closers`);
  }
}

const installs = [];
// sorted: order leaks into the root README
const harnesses = readdirSync(src, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !(entry.name in moduleDirs))
  .map((entry) => entry.name)
  .sort();
for (const harness of harnesses) {
  const values = loadValues(join(src, harness), harness);
  if (values.install) {
    installs.push(
      values.install_label
        ? `${values.install_label}:\n\n${values.install}`
        : values.install,
    );
  }
  const target = join(repo, "packages", `${harness}-tandem`);

  const outputs = new Map([
    [join(target, "LICENSE"), [licenseText, false]],
    ...(values.install
      ? [[join(target, "README.md"), [render(readmeTemplate, values, `${harness}: README.md`), false]]]
      : []),
    ...moduleFiles.map(([file, rel]) => [
      join(target, rel),
      [render(readFileSync(file, "utf8"), values, `${harness}: ${relative(src, file)}`), execFiles.has(file)],
    ]),
    ...(values.prefix ? [[join(target, "lib", "prompt", "prefix.md"), [values.prefix, false]]] : []),
    ...(values.suffix ? [[join(target, "lib", "prompt", "suffix.md"), [values.suffix, false]]] : []),
  ]);

  const stale = ["lib", "skills"]
    .flatMap((dir) => (existsSync(join(target, dir)) ? listTree(join(target, dir)) : []))
    .filter((path) => !outputs.has(path));
  if (!values.install && existsSync(join(target, "README.md"))) {
    stale.push(join(target, "README.md"));
  }

  for (const [dest, [content, exec]] of outputs) {
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, content);
    chmodSync(dest, exec ? 0o755 : 0o644);
  }
  for (const path of stale) {
    console.error(`${harness}: removing stale ${relative(repo, path)}`);
    rmSync(path);
  }
  console.log(`${harness}: rendered ${outputs.size} files`);
}

const rootReadme = render(readmeTemplate, { install: installs.join("\n\n") }, "root: README.md");
const rootPath = join(repo, "README.md");
writeFileSync(rootPath, rootReadme);
console.log("root: rendered README.md");
