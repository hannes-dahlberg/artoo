import * as express from 'express';
export declare type app = {
    domain: string;
    type: 'api' | 'spa';
    routes?: express.Router;
    staticPath?: string;
};
export interface Configs {
    port: number;
    domain: string;
    type: 'api' | 'spa';
    routes?: express.Router;
    staticPath?: string;
    apps?: app[];
}
export declare class Server {
    private configs;
    app: express.Express;
    constructor({ port, type, domain, routes, staticPath, apps }: {
        port?: number;
        type?: 'api' | 'spa';
        domain?: string;
        routes?: express.Router;
        staticPath?: string;
        apps?: app[];
    });
    start(): Promise<void>;
    private createApp;
}
