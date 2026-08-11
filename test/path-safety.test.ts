import { mkdir, rm, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { assertNoSymlinkPath, canonicalDirectory } from "../src/path-safety.js";
import { makeRepository } from "./helpers.js";

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("path safety", () => {
  it("canonicalizes directories and permits ordinary nested outputs", async () => {
    const root = await makeRepository();
    roots.push(root);
    await mkdir(path.join(root, "reports"));
    await expect(canonicalDirectory(root)).resolves.toBe(await canonicalDirectory(root));
    await expect(
      assertNoSymlinkPath(root, path.join(root, "reports", "result.json")),
    ).resolves.toBeUndefined();
  });

  it("rejects files outside the repository", async () => {
    const root = await makeRepository();
    roots.push(root);
    await expect(assertNoSymlinkPath(root, path.resolve(root, "..", "outside"))).rejects.toThrow(
      "inside the repository",
    );
  });

  it("rejects writes through symbolic links when the platform permits creating them", async () => {
    const root = await makeRepository();
    const outside = await makeRepository();
    roots.push(root, outside);
    await writeFile(path.join(outside, "existing.txt"), "outside");
    try {
      await symlink(outside, path.join(root, "linked"), "junction");
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
      if (code === "EPERM" || code === "EACCES") return;
      throw error;
    }
    await expect(
      assertNoSymlinkPath(root, path.join(root, "linked", "result.json")),
    ).rejects.toThrow("symbolic link");
  });

  it("rejects non-directory roots", async () => {
    const root = await makeRepository({ file: "content" });
    roots.push(root);
    await expect(canonicalDirectory(path.join(root, "file"))).rejects.toThrow("Not a directory");
  });
});
