import { rm } from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { loadConfig, parseConfig } from "../src/config.js";
import { makeRepository } from "./helpers.js";

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("configuration", () => {
  it("parses valid configuration and de-duplicates rules", () => {
    expect(
      parseConfig({ threshold: 90, disabledRules: ["quality.lockfile", "quality.lockfile"] }),
    ).toEqual({ threshold: 90, disabledRules: ["quality.lockfile"] });
    expect(parseConfig({})).toEqual({});
  });

  it.each([
    [null, "JSON object"],
    [{ threshold: -1 }, "between 0 and 100"],
    [{ threshold: "90" }, "between 0 and 100"],
    [{ disabledRules: "quality.lockfile" }, "array of rule IDs"],
    [{ disabledRules: ["unknown"] }, "Unknown disabled rule"],
  ])("rejects invalid configuration %#", (value, message) => {
    expect(() => parseConfig(value)).toThrow(message);
  });

  it("loads defaults, discovered config, and explicit config", async () => {
    const root = await makeRepository({
      ".oss-healthcheck.json": '{"threshold":91}',
      "custom.json": '{"threshold":77}',
    });
    roots.push(root);
    await expect(loadConfig(root)).resolves.toEqual({ threshold: 91 });
    await expect(loadConfig(root, path.join(root, "custom.json"))).resolves.toEqual({
      threshold: 77,
    });

    const empty = await makeRepository();
    roots.push(empty);
    await expect(loadConfig(empty)).resolves.toEqual({});
    await expect(loadConfig(empty, path.join(empty, "missing.json"))).rejects.toThrow("not found");
  });

  it("labels invalid JSON", async () => {
    const root = await makeRepository({ ".oss-healthcheck.json": "{" });
    roots.push(root);
    await expect(loadConfig(root)).rejects.toThrow("Invalid JSON");
  });
});
