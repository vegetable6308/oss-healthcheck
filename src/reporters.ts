import path from "node:path";

import type { HealthcheckReport, RuleResult } from "./types.js";

export type OutputFormat = "text" | "json" | "sarif";

function color(enabled: boolean, code: number, value: string): string {
  return enabled ? `\u001B[${String(code)}m${value}\u001B[0m` : value;
}

export function renderText(report: HealthcheckReport, colors = true): string {
  const scoreColor = report.passed ? 32 : 31;
  const lines = [
    "OSS Healthcheck",
    `${color(colors, scoreColor, `${String(report.score)}/100`)} — ${report.passed ? "PASS" : "FAIL"} (minimum ${String(report.threshold)})`,
    "",
  ];

  for (const result of report.results) {
    const marker = result.passed ? color(colors, 32, "✓") : color(colors, 31, "✗");
    lines.push(`${marker} [${String(result.weight).padStart(2)}] ${result.title}`);
    if (!result.passed) lines.push(`    ${result.message}`, `    Fix: ${result.remediation}`);
  }

  lines.push(
    "",
    `${String(report.summary.passed)} passed, ${String(report.summary.failed)} failed, ${String(report.summary.disabled)} disabled`,
  );
  return `${lines.join("\n")}\n`;
}

function sarifResult(result: RuleResult) {
  return {
    ruleId: result.id,
    level: "warning",
    message: { text: `${result.message} ${result.remediation}` },
    locations: [
      {
        physicalLocation: {
          artifactLocation: { uri: result.evidence[0] ?? "." },
        },
      },
    ],
  };
}

export function renderSarif(report: HealthcheckReport): string {
  return JSON.stringify(
    {
      version: "2.1.0",
      $schema: "https://json.schemastore.org/sarif-2.1.0.json",
      runs: [
        {
          tool: {
            driver: {
              name: "OSS Healthcheck",
              version: report.toolVersion,
              informationUri: "https://github.com/vegetable6308/oss-healthcheck",
              rules: report.results.map((result) => ({
                id: result.id,
                shortDescription: { text: result.title },
                fullDescription: { text: result.remediation },
                properties: { category: result.category, weight: result.weight },
              })),
            },
          },
          results: report.results.filter((result) => !result.passed).map(sarifResult),
        },
      ],
    },
    null,
    2,
  );
}

export function renderReport(
  report: HealthcheckReport,
  format: OutputFormat,
  colors = true,
): string {
  if (format === "json") return `${JSON.stringify(report, null, 2)}\n`;
  if (format === "sarif") return `${renderSarif(report)}\n`;
  return renderText(report, colors);
}

export function assertSafeOutputPath(root: string, outputPath: string): string {
  const resolvedRoot = path.resolve(root);
  const resolvedOutput = path.isAbsolute(outputPath)
    ? path.resolve(outputPath)
    : path.resolve(resolvedRoot, outputPath);
  const relative = path.relative(resolvedRoot, resolvedOutput);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Output path must stay inside the scanned repository");
  }
  return resolvedOutput;
}
