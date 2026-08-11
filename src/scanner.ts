import { createRepositoryContext } from "./repository.js";
import { rules } from "./rules.js";
import type { HealthcheckReport, RuleResult, ScanOptions } from "./types.js";

export const VERSION = "0.1.0";

function validateThreshold(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error("Threshold must be a number between 0 and 100");
  }
  return Math.round(value);
}

export async function scanRepository(
  root: string,
  options: ScanOptions = {},
): Promise<HealthcheckReport> {
  const context = await createRepositoryContext(root);
  const threshold = validateThreshold(options.threshold ?? 80);
  const disabled = new Set(options.disabledRules ?? []);
  const activeRules = rules.filter((rule) => !disabled.has(rule.id));
  if (activeRules.length === 0) throw new Error("At least one rule must remain enabled");

  const results: RuleResult[] = [];
  for (const rule of activeRules) {
    const outcome = await rule.evaluate(context);
    results.push({
      id: rule.id,
      title: rule.title,
      category: rule.category,
      weight: rule.weight,
      remediation: rule.remediation,
      ...outcome,
    });
  }

  const availableWeight = results.reduce((sum, result) => sum + result.weight, 0);
  const earnedWeight = results
    .filter((result) => result.passed)
    .reduce((sum, result) => sum + result.weight, 0);
  const score = Math.round((earnedWeight / availableWeight) * 100);

  return {
    schemaVersion: "1.0",
    toolVersion: VERSION,
    root: context.root,
    generatedAt: (options.now ?? new Date()).toISOString(),
    score,
    earnedWeight,
    availableWeight,
    threshold,
    passed: score >= threshold,
    summary: {
      passed: results.filter((result) => result.passed).length,
      failed: results.filter((result) => !result.passed).length,
      disabled: rules.length - activeRules.length,
    },
    results,
  };
}
