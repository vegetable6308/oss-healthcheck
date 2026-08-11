import path from "node:path";
import { describe, expect, it } from "vitest";

import { assertSafeOutputPath, renderReport, renderSarif, renderText } from "../src/reporters.js";
import type { HealthcheckReport } from "../src/types.js";

const report: HealthcheckReport = {
  schemaVersion: "1.0",
  toolVersion: "0.1.0",
  root: "/repo",
  generatedAt: "2026-01-01T00:00:00.000Z",
  score: 50,
  earnedWeight: 5,
  availableWeight: 10,
  threshold: 80,
  passed: false,
  summary: { passed: 1, failed: 1, disabled: 0 },
  results: [
    {
      id: "pass",
      title: "Passing rule",
      category: "quality",
      weight: 5,
      passed: true,
      message: "Present.",
      evidence: ["README.md"],
      remediation: "None.",
    },
    {
      id: "fail",
      title: "Failing rule",
      category: "security",
      weight: 5,
      passed: false,
      message: "Missing.",
      evidence: [],
      remediation: "Add it.",
    },
  ],
};

describe("reporters", () => {
  it("renders readable colored and plain output", () => {
    expect(renderText(report, false)).toContain("50/100 — FAIL");
    expect(renderText(report, false)).toContain("Fix: Add it.");
    expect(renderText({ ...report, passed: true }, true)).toContain("\u001B[");
  });

  it("renders JSON and SARIF with only failed findings", () => {
    expect(JSON.parse(renderReport(report, "json"))).toMatchObject({ score: 50, passed: false });
    const sarif = JSON.parse(renderSarif(report)) as {
      version: string;
      runs: { results: { ruleId: string }[] }[];
    };
    expect(sarif.version).toBe("2.1.0");
    const run = sarif.runs[0];
    if (run === undefined) throw new Error("SARIF run is missing");
    expect(run.results).toHaveLength(1);
    expect(run.results[0]?.ruleId).toBe("fail");
    expect(renderReport(report, "sarif")).toContain('"ruleId": "fail"');
  });

  it("allows output only inside the scanned root", () => {
    const root = path.resolve("fixture");
    expect(assertSafeOutputPath(root, path.join(root, "reports", "health.json"))).toBe(
      path.join(root, "reports", "health.json"),
    );
    expect(() => assertSafeOutputPath(root, path.resolve(root, "..", "outside.json"))).toThrow(
      "inside the scanned repository",
    );
  });
});
