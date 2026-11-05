import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, "dist");
const executable = process.platform === "win32" ? "uv.exe" : "uv";
const uv = (process.env.PATH ?? "")
  .split(delimiter)
  .map((directory) => resolve(directory, executable))
  .find(existsSync);
if (!uv)
  throw new Error("Install uv and add it to PATH before packaging Lambda");
if (!existsSync(join(root, "dashboard", "dist", "index.html"))) {
  throw new Error("Build the dashboard first with npm run build");
}
mkdirSync(output, { recursive: true });

const archiveCode = `
import sys
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
source, archive = map(Path, sys.argv[1:])
with ZipFile(archive, 'w', ZIP_DEFLATED) as bundle:
    for path in sorted(source.rglob('*')):
        if path.is_file() and '__pycache__' not in path.parts:
            bundle.write(path, path.relative_to(source).as_posix())
`;

function run(args) {
  execFileSync(uv, args, { cwd: root, stdio: "inherit" });
}

function copyCode(name, destination) {
  const source = join(root, name);
  cpSync(source, join(destination, name), {
    recursive: true,
    filter: (path) =>
      !relative(source, path)
        .split(sep)
        .some(
          (part) =>
            part === "tests" || part === "__pycache__" || part.endsWith(".pyc"),
        ),
  });
}

for (const [name, group] of [
  ["backend", "server"],
  ["context", "context"],
]) {
  const staging = mkdtempSync(join(tmpdir(), `claims-${name}-`));
  try {
    const requirements = join(staging, "requirements.txt");
    const packagePath = join(staging, "package");
    mkdirSync(packagePath);
    run([
      "export",
      "--frozen",
      "--only-group",
      group,
      "--no-emit-project",
      "--no-hashes",
      "-o",
      requirements,
    ]);
    run([
      "pip",
      "install",
      "--target",
      packagePath,
      "--python-platform",
      "x86_64-manylinux2014",
      "--python-version",
      "3.12",
      "--only-binary",
      ":all:",
      "-r",
      requirements,
    ]);
    copyCode(name, packagePath);
    if (name === "backend") {
      copyCode("data", packagePath);
      cpSync(
        join(root, "dashboard", "dist"),
        join(packagePath, "dashboard", "dist"),
        { recursive: true },
      );
    }
    const archive = join(output, `${name}-lambda.zip`);
    run([
      "run",
      "--no-sync",
      "python",
      "-c",
      archiveCode,
      packagePath,
      archive,
    ]);
    console.log(
      `Built ${relative(root, archive)}: ${(statSync(archive).size / 1024 / 1024).toFixed(1)} MB`,
    );
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
}
