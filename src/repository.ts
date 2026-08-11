import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import type { RepositoryContext } from "./types.js";

const SKIPPED_DIRECTORIES = new Set([
  ".git",
  ".hg",
  ".svn",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".venv",
  "venv",
  "target",
  "vendor",
]);

const MAX_FILES = 50_000;

function normalize(relativePath: string): string {
  return relativePath.split(path.sep).join("/").replace(/^\.\//, "");
}

async function listFiles(root: string): Promise<Set<string>> {
  const result = new Set<string>();
  const pending = [""];

  while (pending.length > 0) {
    const relativeDirectory = pending.pop();
    if (relativeDirectory === undefined) break;
    const absoluteDirectory = path.join(root, relativeDirectory);
    const entries = await readdir(absoluteDirectory, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const relativePath = normalize(path.join(relativeDirectory, entry.name));
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORIES.has(entry.name)) pending.push(relativePath);
      } else if (entry.isFile()) {
        result.add(relativePath);
        if (result.size > MAX_FILES) {
          throw new Error(`Repository contains more than ${String(MAX_FILES)} scanned files`);
        }
      }
    }
  }

  return result;
}

async function parsePackageJson(root: string): Promise<Record<string, unknown> | undefined> {
  try {
    const raw = await readFile(path.join(root, "package.json"), "utf8");
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

export async function createRepositoryContext(rootPath: string): Promise<RepositoryContext> {
  const root = path.resolve(rootPath);
  const files = await listFiles(root);
  const lowerFiles = new Map([...files].map((file) => [file.toLowerCase(), file]));
  const packageJson = await parsePackageJson(root);

  const context: RepositoryContext = {
    root,
    files,
    lowerFiles,
    ...(packageJson === undefined ? {} : { packageJson }),
    async read(relativePath) {
      const actual = lowerFiles.get(normalize(relativePath).toLowerCase());
      if (actual === undefined) return undefined;
      try {
        return await readFile(path.join(root, actual), "utf8");
      } catch {
        return undefined;
      }
    },
    has(relativePath) {
      return lowerFiles.has(normalize(relativePath).toLowerCase());
    },
    find(pattern) {
      return [...files].filter((file) => {
        pattern.lastIndex = 0;
        return pattern.test(file);
      });
    },
  };

  return context;
}
