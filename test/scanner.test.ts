import { rm } from "node:fs/promises";
import { afterEach, describe, expect, it } from "vitest";

import { rules } from "../src/rules.js";
import { scanRepository } from "../src/scanner.js";
import { completeRepository, makeRepository } from "./helpers.js";

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("scanRepository", () => {
  it("scores a complete repository at 100", async () => {
    const root = await makeRepository(completeRepository);
    roots.push(root);
    const report = await scanRepository(root, {
      threshold: 100,
      now: new Date("2026-01-02T03:04:05Z"),
    });

    expect(rules.reduce((sum, rule) => sum + rule.weight, 0)).toBe(100);
    expect(report.score).toBe(100);
    expect(report.passed).toBe(true);
    expect(report.summary).toEqual({ passed: 19, failed: 0, disabled: 0 });
    expect(report.generatedAt).toBe("2026-01-02T03:04:05.000Z");
  });

  it("reports actionable failures for an empty repository", async () => {
    const root = await makeRepository();
    roots.push(root);
    const report = await scanRepository(root);

    expect(report.score).toBe(0);
    expect(report.passed).toBe(false);
    expect(report.results).toHaveLength(19);
    expect(report.results.every((result) => result.remediation.length > 10)).toBe(true);
  });

  it("normalizes the score after disabling a rule", async () => {
    const withoutLicense = Object.fromEntries(
      Object.entries(completeRepository).filter(([file]) => file !== "LICENSE"),
    );
    const root = await makeRepository(withoutLicense);
    roots.push(root);
    const report = await scanRepository(root, { threshold: 100, disabledRules: ["legal.license"] });

    expect(report.score).toBe(100);
    expect(report.availableWeight).toBe(92);
    expect(report.summary.disabled).toBe(1);
  });

  it("rejects invalid thresholds and an empty active rule set", async () => {
    const root = await makeRepository();
    roots.push(root);
    await expect(scanRepository(root, { threshold: 101 })).rejects.toThrow("between 0 and 100");
    await expect(
      scanRepository(root, { disabledRules: rules.map((rule) => rule.id) }),
    ).rejects.toThrow("At least one rule");
  });

  it("recognizes alternative manifests and reports incomplete documents", async () => {
    const root = await makeRepository({
      "README.rst": "Short readme",
      "LICENSE.txt": "short",
      "SECURITY.md": "Contact us",
      "pyproject.toml": "[project]\nname='fixture'",
      "tests/test_example.py": "def test_ok(): assert True",
      "ruff.toml": "line-length = 100",
      "uv.lock": "version = 1",
    });
    roots.push(root);
    const report = await scanRepository(root, { threshold: 0 });

    expect(report.passed).toBe(true);
    expect(report.results.find((result) => result.id === "docs.readme")?.passed).toBe(false);
    expect(report.results.find((result) => result.id === "legal.license")?.passed).toBe(false);
    expect(report.results.find((result) => result.id === "metadata.project")?.passed).toBe(true);
    expect(report.results.find((result) => result.id === "quality.tests")?.passed).toBe(true);
  });
});
