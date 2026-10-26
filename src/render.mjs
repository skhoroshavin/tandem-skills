#!/usr/bin/env node
// Renders src/ into packages/<harness>-tandem/ and the root README.md
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, chmodSync, rmSync } from "node:fs";
import { join, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(repo, "src");

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

// shared trees, injected into every package
const systemPromptDir = join(src, "system-prompt");
const skillsDir = join(src, "skills");
const sharedFiles = [
  ...listTree(systemPromptDir).map((file) => [file, join("system-prompt", relative(systemPromptDir, file))]),
  ...listTree(skillsDir).map((file) => [file, join("skills", relative(skillsDir, file))]),
];
for (const [file] of sharedFiles) {
  if (!file.endsWith(".md")) continue;
  const text = readFileSync(file, "utf8");
  const openers = (text.match(/<!--cli:/g) || []).length;
  const closers = (text.match(/<!--\/cli-->/g) || []).length;
  if (openers !== closers) {
    throw new Error(`${relative(src, file)}: unbalanced cli markers: ${openers} openers, ${closers} closers`);
  }
}

const harnessesDir = join(src, "harness");
// sorted: this becomes the order of install sections in the root README
const harnesses = readdirSync(harnessesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const installs = [];
for (const harness of harnesses) {
  const harnessDir = join(harnessesDir, harness);
  const setting = (name) => {
    const path = join(harnessDir, "settings", name);
    return existsSync(path) ? readFileSync(path, "utf8").trimEnd() : "";
  };
  const values = {
    harness,
    install: setting("install.md"),
    install_label: setting("install-label.txt"),
    worker_cmd: setting("worker-cmd.txt"),
    worker_cmd_model: setting("worker-cmd-model.txt"),
  };
  if (values.install) {
    installs.push(values.install_label ? `${values.install_label}:\n\n${values.install}` : values.install);
  }

  const target = join(repo, "packages", `${harness}-tandem`);
  // wipe the package, sparing npm artifacts; stale files die here
  if (existsSync(target)) {
    for (const entry of readdirSync(target)) {
      if (entry !== "node_modules" && entry !== "package-lock.json") {
        rmSync(join(target, entry), { recursive: true, force: true });
      }
    }
  }

  // harness tree (settings/ is consumed as values above, never copied), shared trees, README, LICENSE
  const writeFile = (destRel, content, exec) => {
    const dest = join(target, destRel);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, content);
    chmodSync(dest, exec ? 0o755 : 0o644);
  };
  const copy = (srcFile, destRel) =>
    writeFile(
      destRel,
      render(readFileSync(srcFile, "utf8"), values, `${harness}: ${relative(src, srcFile)}`),
      statSync(srcFile).mode & 0o111,
    );
  for (const file of listTree(harnessDir)) {
    if (relative(harnessDir, file).split(sep)[0] !== "settings") {
      copy(file, relative(harnessDir, file));
    }
  }
  for (const [file, rel] of sharedFiles) copy(file, rel);
  if (values.install) writeFile("README.md", render(readmeTemplate, values, `${harness}: README.md`));
  writeFile("LICENSE", licenseText);

  console.log(`${harness}: rendered`);
}

const rootReadme = render(readmeTemplate, { install: installs.join("\n\n") }, "root: README.md");
writeFileSync(join(repo, "README.md"), rootReadme);
console.log("root: rendered README.md");
