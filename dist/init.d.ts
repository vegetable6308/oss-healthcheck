interface InitOptions {
    force?: boolean;
}
export interface InitResult {
    created: string[];
    skipped: string[];
}
export declare function initializeRepository(rootPath: string, options?: InitOptions): Promise<InitResult>;
export {};
//# sourceMappingURL=init.d.ts.map