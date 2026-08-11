import type { HealthcheckReport } from "./types.js";
export type OutputFormat = "text" | "json" | "sarif";
export declare function renderText(report: HealthcheckReport, colors?: boolean): string;
export declare function renderSarif(report: HealthcheckReport): string;
export declare function renderReport(report: HealthcheckReport, format: OutputFormat, colors?: boolean): string;
export declare function assertSafeOutputPath(root: string, outputPath: string): string;
//# sourceMappingURL=reporters.d.ts.map