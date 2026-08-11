export interface CliIO {
    stdout(value: string): void;
    stderr(value: string): void;
    isTTY: boolean;
}
export declare function runCli(args: string[], io: CliIO): Promise<number>;
//# sourceMappingURL=cli-core.d.ts.map