import * as Promise from 'bluebird';
export declare enum Mode {
    recursive = 0,
    simultaneous = 1
}
export interface Output {
    results: Array<{
        result?: any;
        error?: Error;
    }>;
    resolves: number;
    rejects: number;
}
export declare class Prom {
    static sequence(promises?: Array<() => Promise<any>>, { mode, breakOnResolve, breakOnReject, output }?: {
        mode?: Mode;
        breakOnResolve?: boolean;
        breakOnReject?: boolean;
        output?: Output;
    }): Promise<Output>;
    static wait(wait: number): Promise<void>;
    static and(promises: Array<any>, mode?: Mode): Promise<{}>;
    static or(promises: Array<any>, mode?: Mode): Promise<{}>;
}
