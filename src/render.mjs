#!/usr/bin/env node
// Renders src/ templates into packages/<harness>-tandem/ and the root README.md
import { readFileSync, writeFileSync, readdirSync, statSync, lstatSync, existsSync, mkdirSync, chmodSync, rmSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(repo, "src");

function loadValues(harnessDir) {
  const value = (name) => {
    const path = join(harnessDir, name);
    return existsSync(path) ? readFileSync(path, "utf8").trimEnd() : "";
  };
  const prefix = value("prompt-prefix.md");
  return {
    // prefix is inlined into the template; blank line separates it from the body
    prompt_prefix: prefix ? `${prefix}\n\n` : "",
    worker_cmd: value("worker-cmd.txt"),
    install: value("install.md"),
    install_label: value("install-label.txt"),
  };
}

function render(text, values, where) {
  const openers = (text.match(/<!--cli:/g) || []).length;
  const closers = (text.match(/<!--\/cli-->/g) || []).length;
  if (openers !== closers) {
    throw new Error(`${where}: unbalanced cli markers: ${openers} openers, ${closers} closers`);
  }
  const out = text.replace(/{{([a-z_]+)}}/g, (match, key) => {
    if (!(key in values)) throw new Error(`${where}: unresolved placeholder: ${match}`);
    return values[key];
  });
  const leftover = out.match(/{{[^}]*}}/);
  if (leftover) throw new Error(`${where}: unresolved placeholder: ${leftover[0]}`);
  return out;
}

// writes follow symlinks; a symlinked segment would silently redirect them (e.g. into src/)
function assertNoSymlinkPath(root, path) {
  let current = root;
  for (const segment of relative(root, path).split(sep)) {
    current = join(current, segment);
    const stats = lstatSync(current, { throwIfNoEntry: false });
    if (stats?.isSymbolicLink()) {
      throw new Error(`refusing to write through symlink: ${current}`);
    }
  }
}

const listTree = (dir) =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => join(e.parentPath, e.name));

const promptTemplate = readFileSync(join(src, "prompt.md"), "utf8");
const readmeTemplate = readFileSync(join(src, "README.md"), "utf8");
const licenseText = readFileSync(join(repo, "LICENSE"), "utf8");
const skillFiles = listTree(join(src, "skills"));
const execFiles = new Set(skillFiles.filter((f) => statSync(f).mode & 0o111));
const runtimeDir = join(src, "runtime");
const runtimeFiles = existsSync(runtimeDir) ? listTree(runtimeDir) : [];

const installs = [];
// src/ dirs except skills/ (the template) and runtime/ (shared helpers) are harnesses; sorted: order leaks into the root README
const harnesses = readdirSync(src, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== "skills" && entry.name !== "runtime")
  .map((entry) => entry.name)
  .sort();
for (const harness of harnesses) {
  const values = loadValues(join(src, harness));
  if (values.install) {
    installs.push(
      values.install_label
        ? `${values.install_label}:\n\n${values.install}`
        : values.install,
    );
  }
  const target = join(repo, "packages", `${harness}-tandem`);

  const outputs = new Map([
    [join(target, "prompt.md"), [render(promptTemplate, values, `${harness}: prompt.md`), false]],
    [join(target, "LICENSE"), [licenseText, false]],
    ...(values.install
      ? [[join(target, "README.md"), [render(readmeTemplate, values, `${harness}: README.md`), false]]]
      : []),
    ...skillFiles.map((file) => [
      join(target, relative(src, file)),
      [render(readFileSync(file, "utf8"), values, `${harness}: ${relative(src, file)}`), execFiles.has(file)],
    ]),
    ...runtimeFiles.map((file) => [
      join(target, relative(src, file)),
      [readFileSync(file, "utf8"), false],
    ]),
  ]);

  const stale = existsSync(join(target, "skills"))
    ? listTree(join(target, "skills")).filter((path) => !outputs.has(path))
    : [];
  if (!values.install && existsSync(join(target, "README.md"))) {
    stale.push(join(target, "README.md"));
  }

  for (const [dest, [content, exec]] of outputs) {
    assertNoSymlinkPath(target, dest);
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
assertNoSymlinkPath(repo, rootPath);
writeFileSync(rootPath, rootReadme);
console.log("root: rendered README.md");
