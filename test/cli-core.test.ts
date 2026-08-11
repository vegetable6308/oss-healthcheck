import { readFile, rm } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { runCli, type CliIO } from "../src/cli-core.js";
import { makeRepository } from "./helpers.js";

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

function capture(): { io: CliIO; stdout: string[]; stderr: string[] } {
  const stdout: string[] = [];
  const stderr: string[] = [];
  return {
    stdout,
    stderr,
    io: {
      stdout: (value) => stdout.push(value),
      stderr: (value) => stderr.push(value),
      isTTY: false,
    },
  };
}

describe("runCli", () => {
  it("handles help, version, and rule listing", async () => {
    for (const [args, expected] of [
      [["--help"], "Usage:"],
      [["--version"], "0.1.0"],
      [["rules"], "docs.readme"],
    ] as const) {
      const output = capture();
      await expect(runCli([...args], output.io)).resolves.toBe(0);
      expect(output.stdout.join("")).toContain(expected);
    }
  });

  it("initializes and scans a repository", async () => {
    const root = await makeRepository();
    roots.push(root);
    const initialized = capture();
    await expect(runCli(["init", root], initialized.io)).resolves.toBe(0);
    expect(initialized.stdout.join("")).toContain("Created 7 file");

    const scanned = capture();
    await expect(
      runCli(["scan", root, "--format", "json", "--min-score", "100"], scanned.io),
    ).resolves.toBe(1);
    expect(JSON.parse(scanned.stdout.join(""))).toMatchObject({ passed: false, threshold: 100 });
  });

  it("writes reports inside the repository", async () => {
    const root = await makeRepository();
    roots.push(root);
    const output = capture();
    await expect(
      runCli(
        [root, "--format", "sarif", "--output", "reports/result.sarif", "--min-score", "0"],
        output.io,
      ),
    ).resolves.toBe(0);
    expect(output.stdout.join("")).toContain("Report written");
    expect(await readFile(path.join(root, "reports/result.sarif"), "utf8")).toContain(
      '"version": "2.1.0"',
    );
  });

  it.each([
    [["--unknown"], "Unknown option"],
    [["--format", "xml"], "Unsupported format"],
    [["--min-score"], "requires a value"],
    [["one", "two"], "Unexpected argument"],
  ])("returns usage errors for %j", async (args, expected) => {
    const output = capture();
    await expect(runCli(args, output.io)).resolves.toBe(2);
    expect(output.stderr.join("")).toContain(expected);
  });

  it("rejects output traversal", async () => {
    const root = await makeRepository();
    roots.push(root);
    const output = capture();
    await expect(
      runCli([root, "--output", path.resolve(root, "..", "outside.txt")], output.io),
    ).resolves.toBe(2);
    expect(output.stderr.join("")).toContain("inside the scanned repository");
  });
});
