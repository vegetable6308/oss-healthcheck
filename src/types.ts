export type Category =
  "documentation" | "community" | "security" | "automation" | "quality" | "release";

export interface RuleResult {
  id: string;
  title: string;
  category: Category;
  weight: number;
  passed: boolean;
  message: string;
  evidence: string[];
  remediation: string;
}

export interface HealthcheckReport {
  schemaVersion: "1.0";
  toolVersion: string;
  root: string;
  generatedAt: string;
  score: number;
  earnedWeight: number;
  availableWeight: number;
  threshold: number;
  passed: boolean;
  summary: {
    passed: number;
    failed: number;
    disabled: number;
  };
  results: RuleResult[];
}

export interface HealthcheckConfig {
  threshold?: number;
  disabledRules?: string[];
}

export interface ScanOptions {
  threshold?: number;
  disabledRules?: string[];
  now?: Date;
}

export interface RepositoryContext {
  root: string;
  files: Set<string>;
  lowerFiles: Map<string, string>;
  packageJson?: Record<string, unknown>;
  read(relativePath: string): Promise<string | undefined>;
  has(relativePath: string): boolean;
  find(pattern: RegExp): string[];
}

export interface Rule {
  id: string;
  title: string;
  category: Category;
  weight: number;
  remediation: string;
  evaluate(
    context: RepositoryContext,
  ): Promise<Omit<RuleResult, "id" | "title" | "category" | "weight" | "remediation">>;
}
