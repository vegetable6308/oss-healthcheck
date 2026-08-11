import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { createRepositoryContext } from "../src/repository.js";
import { makeRepository } from "./helpers.js";

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("createRepositoryContext", () => {
  it("normalizes paths, supports case-insensitive lookup, and skips dependency trees", async () => {
    const root = await makeRepository({
      "Docs/README.MD": "hello",
      "package.json": '{"name":"fixture"}',
    });
    roots.push(root);
    await mkdir(path.join(root, "node_modules", "ignored"), { recursive: true });
    await writeFile(path.join(root, "node_modules", "ignored", "README.md"), "ignored");

    const context = await createRepositoryContext(root);
    expect(context.has("docs/readme.md")).toBe(true);
    expect(await context.read("DOCS/README.md")).toBe("hello");
    expect(context.find(/readme/i)).toEqual(["Docs/README.MD"]);
    expect([...context.files].some((file) => file.includes("node_modules"))).toBe(false);
    expect(context.packageJson?.name).toBe("fixture");
  });

  it("tolerates invalid package metadata and missing reads", async () => {
    const root = await makeRepository({ "package.json": "not json" });
    roots.push(root);
    const context = await createRepositoryContext(root);
    expect(context.packageJson).toBeUndefined();
    expect(await context.read("missing.txt")).toBeUndefined();
  });
});
