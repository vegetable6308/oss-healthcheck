import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { loadConfig } from "./config.js";
import { initializeRepository } from "./init.js";
import { assertNoSymlinkPath, canonicalDirectory } from "./path-safety.js";
import { assertSafeOutputPath, renderReport, type OutputFormat } from "./reporters.js";
import { ruleIds } from "./rules.js";
import { scanRepository, VERSION } from "./scanner.js";

export interface CliIO {
  stdout(value: string): void;
  stderr(value: string): void;
  isTTY: boolean;
}

interface ParsedScan {
  command: "scan";
  root: string;
  format: OutputFormat;
  threshold?: number;
  configPath?: string;
  outputPath?: string;
  colors: boolean;
}

interface ParsedInit {
  command: "init";
  root: string;
  force: boolean;
}

type ParsedMeta = { command: "help" } | { command: "version" } | { command: "rules" };

type ParsedArguments = ParsedScan | ParsedInit | ParsedMeta;

const HELP = `OSS Healthcheck ${VERSION}

Usage:
  oss-healthcheck [scan] [path] [options]
  oss-healthcheck init [path] [--force]
  oss-healthcheck rules

Scan options:
  --format <text|json|sarif>  Output format (default: text)
  --min-score <0-100>        Override the configured passing score
  --config <path>            Use an explicit JSON configuration
  --output <path>            Write the report inside the repository
  --no-color                 Disable ANSI colors
  -h, --help                 Show help
  -v, --version              Show version

Exit codes: 0 passed, 1 below threshold, 2 invalid input or runtime error.
`;

function nextValue(args: string[], index: number, option: string): string {
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) throw new Error(`${option} requires a value`);
  return value;
}

function parseArguments(args: string[]): ParsedArguments {
  if (args.includes("--help") || args.includes("-h")) return { command: "help" };
  if (args.includes("--version") || args.includes("-v")) return { command: "version" };
  if (args[0] === "rules") return { command: "rules" };

  const command = args[0] === "init" ? "init" : "scan";
  let root = ".";
  let rootSet = false;
  let format: OutputFormat = "text";
  let threshold: number | undefined;
  let configPath: string | undefined;
  let outputPath: string | undefined;
  let colors = true;
  let force = false;
  const start = args[0] === "scan" || args[0] === "init" ? 1 : 0;

  for (let index = start; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === undefined) continue;
    if (argument === "--force" && command === "init") {
      force = true;
    } else if (argument === "--no-color") {
      colors = false;
    } else if (argument === "--format") {
      const value = nextValue(args, index, argument);
      if (value !== "text" && value !== "json" && value !== "sarif") {
        throw new Error(`Unsupported format: ${value}`);
      }
      format = value;
      index += 1;
    } else if (argument === "--min-score") {
      threshold = Number(nextValue(args, index, argument));
      index += 1;
    } else if (argument === "--config") {
      configPath = nextValue(args, index, argument);
      index += 1;
    } else if (argument === "--output") {
      outputPath = nextValue(args, index, argument);
      index += 1;
    } else if (argument.startsWith("-")) {
      throw new Error(`Unknown option: ${argument}`);
    } else if (!rootSet) {
      root = argument;
      rootSet = true;
    } else {
      throw new Error(`Unexpected argument: ${argument}`);
    }
  }

  if (command === "init") return { command, root, force };
  return {
    command,
    root,
    format,
    colors,
    ...(threshold === undefined ? {} : { threshold }),
    ...(configPath === undefined ? {} : { configPath }),
    ...(outputPath === undefined ? {} : { outputPath }),
  };
}

export async function runCli(args: string[], io: CliIO): Promise<number> {
  try {
    const parsed = parseArguments(args);
    if (parsed.command === "help") {
      io.stdout(HELP);
      return 0;
    }
    if (parsed.command === "version") {
      io.stdout(`${VERSION}\n`);
      return 0;
    }
    if (parsed.command === "rules") {
      io.stdout(`${ruleIds().join("\n")}\n`);
      return 0;
    }
    if (parsed.command === "init") {
      const result = await initializeRepository(parsed.root, { force: parsed.force });
      io.stdout(
        `Created ${String(result.created.length)} file(s); skipped ${String(result.skipped.length)} existing file(s).\n`,
      );
      for (const file of result.created) io.stdout(`  + ${file}\n`);
      return 0;
    }

    const root = await canonicalDirectory(parsed.root);
    const config = await loadConfig(root, parsed.configPath);
    const report = await scanRepository(root, {
      ...((parsed.threshold ?? config.threshold) === undefined
        ? {}
        : { threshold: parsed.threshold ?? config.threshold }),
      ...(config.disabledRules === undefined ? {} : { disabledRules: config.disabledRules }),
    });
    const rendered = renderReport(report, parsed.format, parsed.colors && io.isTTY);
    if (parsed.outputPath === undefined) {
      io.stdout(rendered);
    } else {
      const destination = assertSafeOutputPath(root, parsed.outputPath);
      await assertNoSymlinkPath(root, destination);
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, rendered, "utf8");
      io.stdout(`Report written to ${path.relative(process.cwd(), destination)}\n`);
    }
    return report.passed ? 0 : 1;
  } catch (error) {
    io.stderr(`oss-healthcheck: ${error instanceof Error ? error.message : String(error)}\n`);
    return 2;
  }
}
