import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { initializeRepository } from "../src/init.js";
import { makeRepository } from "./helpers.js";

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("initializeRepository", () => {
  it("creates templates without overwriting existing files", async () => {
    const root = await makeRepository({ "SECURITY.md": "custom" });
    roots.push(root);
    const result = await initializeRepository(root);
    expect(result.created).toHaveLength(6);
    expect(result.skipped).toEqual(["SECURITY.md"]);
    expect(await readFile(path.join(root, "SECURITY.md"), "utf8")).toBe("custom");
  });

  it("overwrites the known templates only when forced", async () => {
    const root = await makeRepository();
    roots.push(root);
    await initializeRepository(root);
    await writeFile(path.join(root, "SUPPORT.md"), "custom");
    const result = await initializeRepository(root, { force: true });
    expect(result.created).toHaveLength(7);
    expect(result.skipped).toHaveLength(0);
    expect(await readFile(path.join(root, "SUPPORT.md"), "utf8")).toContain("# Support");
  });
});
