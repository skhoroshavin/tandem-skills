#!/usr/bin/env node
// Renders src/ into packages/<harness>-tandem/ and the root README.md
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, chmodSync, rmSync } from "node:fs";
import { join, dirname, relative } from "node:path";
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
  // the harness dir holds only values consumed here, nothing is copied from it
  const values = {
    harness,
    ...JSON.parse(readFileSync(join(harnessDir, "settings.json"), "utf8")),
    install: existsSync(join(harnessDir, "install.md"))
      ? readFileSync(join(harnessDir, "install.md"), "utf8").trimEnd()
      : "",
  };
  if (values.install) {
    installs.push(values.label ? `${values.label}:\n\n${values.install}` : values.install);
  }

  const target = join(repo, "packages", `${harness}-tandem`);
  // system-prompt/ and skills/ are render-owned; everything else in the package is hand-maintained
  rmSync(join(target, "system-prompt"), { recursive: true, force: true });
  rmSync(join(target, "skills"), { recursive: true, force: true });

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
  for (const [file, rel] of sharedFiles) copy(file, rel);
  for (const edge of ["prefix.md", "suffix.md"]) {
    const file = join(harnessDir, edge);
    if (existsSync(file)) copy(file, join("system-prompt", edge));
  }
  if (values.install) writeFile("README.md", render(readmeTemplate, values, `${harness}: README.md`));
  else rmSync(join(target, "README.md"), { force: true });
  writeFile("LICENSE", licenseText);

  console.log(`${harness}: rendered`);
}

const rootReadme = render(readmeTemplate, { install: installs.join("\n\n") }, "root: README.md");
writeFileSync(join(repo, "README.md"), rootReadme);
console.log("root: rendered README.md");
