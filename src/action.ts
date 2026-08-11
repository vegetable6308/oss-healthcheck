import { appendFile } from "node:fs/promises";

import { renderText } from "./reporters.js";
import { scanRepository } from "./scanner.js";

function input(name: string): string | undefined {
  const value = process.env[`INPUT_${name.toUpperCase().replaceAll("-", "_")}`]?.trim();
  return value === "" ? undefined : value;
}

async function setOutput(name: string, value: string): Promise<void> {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile === undefined) return;
  await appendFile(outputFile, `${name}=${value}\n`, "utf8");
}

try {
  const workspace = process.env.GITHUB_WORKSPACE ?? ".";
  const thresholdInput = input("min-score");
  const threshold = thresholdInput === undefined ? 80 : Number(thresholdInput);
  const report = await scanRepository(workspace, { threshold });
  process.stdout.write(renderText(report, false));
  await setOutput("score", String(report.score));
  await setOutput("passed", String(report.passed));
  if (!report.passed) process.exitCode = 1;
} catch (error) {
  process.stderr.write(
    `::error title=OSS Healthcheck failed::${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 2;
}
