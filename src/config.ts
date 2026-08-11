import { readFile } from "node:fs/promises";
import path from "node:path";

import { ruleIds } from "./rules.js";
import type { HealthcheckConfig } from "./types.js";

const DEFAULT_CONFIG_NAMES = [".oss-healthcheck.json", "oss-healthcheck.config.json"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseConfig(value: unknown): HealthcheckConfig {
  if (!isRecord(value)) throw new Error("Configuration must be a JSON object");
  const config: HealthcheckConfig = {};

  if (value.threshold !== undefined) {
    if (typeof value.threshold !== "number" || value.threshold < 0 || value.threshold > 100) {
      throw new Error("Configuration threshold must be between 0 and 100");
    }
    config.threshold = value.threshold;
  }

  if (value.disabledRules !== undefined) {
    if (
      !Array.isArray(value.disabledRules) ||
      !value.disabledRules.every((item) => typeof item === "string")
    ) {
      throw new Error("Configuration disabledRules must be an array of rule IDs");
    }
    const known = new Set(ruleIds());
    const unknown = value.disabledRules.filter((id) => !known.has(id));
    if (unknown.length > 0) throw new Error(`Unknown disabled rule(s): ${unknown.join(", ")}`);
    config.disabledRules = [...new Set(value.disabledRules)];
  }

  return config;
}

export async function loadConfig(root: string, explicitPath?: string): Promise<HealthcheckConfig> {
  const candidates =
    explicitPath === undefined
      ? DEFAULT_CONFIG_NAMES.map((name) => path.join(root, name))
      : [path.resolve(explicitPath)];

  for (const candidate of candidates) {
    try {
      const raw = await readFile(candidate, "utf8");
      return parseConfig(JSON.parse(raw) as unknown);
    } catch (error) {
      const code = isRecord(error) && typeof error.code === "string" ? error.code : undefined;
      if (code === "ENOENT" && explicitPath === undefined) continue;
      if (code === "ENOENT") {
        throw new Error(`Configuration file not found: ${candidate}`, { cause: error });
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Invalid JSON in configuration: ${candidate}`, { cause: error });
      }
      throw error;
    }
  }
  return {};
}
