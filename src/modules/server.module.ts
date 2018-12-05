// Importing node modules
import * as bodyParser from "body-parser";
import * as cors from "cors";
import { CorsOptions, CorsOptionsDelegate } from "cors";
import * as express from "express";
import { Express } from "express";
import * as http from "http";
import * as path from "path";
import * as vhost from "vhost";

import { configs as artooConfigs } from "./configs.module";
import { container } from "./container.module";
container.set("express", express);

export type corsConfigType = string | string[] | CorsOptions | CorsOptionsDelegate;

// Config interface
export interface IApp {
    domain: string;
    type?: "api" | "spa";
    corsConfig?: corsConfigType;
    routes?: express.Router;
    staticPath?: string;
}
export interface IConfig {
    port?: number;
    domain?: string;
    type?: "api" | "spa";
    corsConfig?: corsConfigType;
    routes?: express.Router;
    staticPath?: string;
    apps?: IApp[];
}

export class Server {

    // App
    public app: express.Express;
    // Configs
    private configs: IConfig;

    constructor({
        port = 1234,
        domain = "app.test",
        type = "api",
        corsConfig,
        routes,
        staticPath = artooConfigs.paths.serverStaticDefaultPath,
        apps = [],
    }: IConfig = {}) {
        // Setting configs
        this.configs = { port, type, corsConfig, domain, routes, staticPath, apps };

        // Creating the express app
        this.app = container.get<any>("express")() as Express;

        if (this.configs.apps.length === 0) {
            this.configs.apps.push({
                corsConfig: this.configs.corsConfig,
                domain: this.configs.domain,
                routes: this.configs.routes,
                staticPath: this.configs.staticPath,
                type: this.configs.type,
            });
        }
        for (const a of this.configs.apps) {
            if (a.staticPath) { a.staticPath = artooConfigs.paths.serverStaticDefaultPath; }

            this.app.use(this.createApp(a));
        }
    }
    public start(): Promise<http.Server> {
        return new Promise((resolve, reject) => {
            // Start server
            const listner = this.app.listen(this.configs.port, () => {
                this.configs.apps.forEach((app) => {
                    console.log(`Serving ${app.type.toUpperCase()} on: ${app.domain}:${this.configs.port}${(app.type === "spa" && app.staticPath) ? ` with static root: "${app.staticPath}"` : ``}`);
                });
                resolve(listner);
            });
        });
    }

    private createApp({
        type = "api",
        domain,
        corsConfig,
        routes,
        staticPath,
    }: IApp): vhost.RequestHandler {
        const app: express.Express = express();
        if (type === "api") {
            if (corsConfig) {
                if (typeof corsConfig === "string" || corsConfig instanceof Array) {
                    corsConfig = {
                        origin: corsConfig,
                    };
                }
                app.use(cors(corsConfig));
            }

            // Attaching body parser
            app.use(bodyParser.urlencoded({
                extended: true,
            }));

            // Parse post body as json
            app.use(bodyParser.json());

            if (routes) {
                app.use("/", routes);
            }

        } else if (type === "spa" && staticPath) {
            app.use(express.static(staticPath));
            app.get("*", (request: express.Request, response: express.Response) => {
                response.sendFile("index.html", { root: staticPath });
            });
        }

        return vhost(domain, app);
    }
}
