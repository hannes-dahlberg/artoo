// Importing node modules
import * as bodyParser from "body-parser";
import * as cors from "cors";
import { CorsOptions, CorsOptionsDelegate } from "cors";
import * as express from "express";
import { NextFunction, Request, RequestHandler, Response, Express } from "express";
import * as http from "http";
import * as https from "https";
import * as tls from "tls";
import * as vhost from "vhost";

import { ConfigService } from "../services/config.service";
import { container } from "./container.module";
container.set("express", express);

const configService: ConfigService = container.getService(ConfigService);

export type corsConfigType = string | string[] | CorsOptions | CorsOptionsDelegate;
export type credentials = {
    cert: string,
    key: string
}

// Config interface
export interface IApp {
    domain: string;
    type?: "api" | "spa";
    corsConfig?: corsConfigType;
    routes?: express.Router;
    staticPath?: string;
    https?: boolean;
    httpsRedirect?: boolean;
    credentials?: credentials;
}
export interface IConfig {
    port?: number;
    securePort?: number,
    domain?: string;
    type?: "api" | "spa";
    corsConfig?: corsConfigType;
    routes?: express.Router;
    staticPath?: string;
    apps?: IApp[];
    https?: boolean;
    httpsRedirect?: boolean;
    credentials?: credentials;
}

export class Server {

    // App
    public app: express.Express;
    // Configs
    private configs: IConfig;

    constructor({
        port = 1234,
        securePort = 1235,
        domain = "app.test",
        type = "api",
        corsConfig,
        routes,
        staticPath,
        apps = [],
        credentials,
    }: IConfig = {}) {
        // Setting configs
        this.configs = { port, securePort, type, corsConfig, domain, routes, staticPath, apps, credentials, };

        // Creating the express app
        this.app = container.get<any>("express")() as Express;

        if (this.configs.apps.length === 0) {
            this.configs.apps.push({
                corsConfig: this.configs.corsConfig,
                domain: this.configs.domain,
                routes: this.configs.routes,
                staticPath: this.configs.staticPath,
                type: this.configs.type,
                credentials: this.configs.credentials,
            });
        }
        for (const a of this.configs.apps) {
            this.app.use(this.createApp(a));
        }
    }
    public start(): Promise<http.Server> {
        return new Promise((resolve, reject) => {
            // Start http server
            const listner = this.app.listen(this.configs.port, () => {
                this.configs.apps.filter((app: IApp) => app.https && app.httpsRedirect).forEach((app: IApp) => {
                    console.log(`Serving ${app.type.toUpperCase()} on: http://${app.domain}:${this.configs.port}${(app.type === "spa" && app.staticPath) ? ` with static root: "${app.staticPath}"` : ``}`);
                });
                resolve(listner);
            });

            //If any app is set to use https start https server
            if (this.configs.apps.find((app: IApp) => app.https)) {
                https.createServer({
                    SNICallback: (domain: string, callback) => {
                        let config = this.configs.apps.find((app: IApp) => app.domain === domain && app.https && app.credentials !== undefined);
                        if (config !== undefined) {
                            callback(null, tls.createSecureContext({
                                cert: config.credentials.cert,
                                key: config.credentials.key,
                            }));
                        } else {
                            callback(null, tls.createSecureContext({
                                cert: "",
                                key: ""
                            }));
                        }
                    },
                    key: "",
                    cert: "",
                }, this.app).listen(this.configs.securePort, () => {
                    this.configs.apps.filter((app: IApp) => app.https && app.credentials !== undefined).forEach((app: IApp) => {
                        console.log(`Serving ${app.type.toUpperCase()} on: https://${app.domain}:${this.configs.securePort}${(app.type === "spa" && app.staticPath) ? ` with static root: "${app.staticPath}"` : ``}`);
                    });
                });
            }
        });
    }

    private createApp({
        type = "api",
        domain,
        corsConfig,
        routes,
        staticPath,
        https,
        httpsRedirect,
        credentials
    }: IApp): vhost.RequestHandler {
        const app: express.Express = express();

        if (https && httpsRedirect) {
            app.get('*', (request: Request, response: Response, next: NextFunction) => {
                if (request.protocol === "http") { response.redirect(`https://${request.headers.host.replace(`:${this.configs.port}`, `:${this.configs.securePort}`)}${request.url}`); return; }
                next();
            });
        }

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

        } else if (type === "spa") {
            if (staticPath) {
                app.head('/api_base_url', (request: Request, response: Response, next: NextFunction) => {
                    response.setHeader("api_base_url", `${request.protocol}://${configService.get("API_HOST", "api.test.test")}:${configService.get("PORT", "1234")}`)
                    next();
                });
                app.use(express.static(staticPath));
                app.get("*", (request: Request, response: Response) => {
                    response.sendFile("index.html", { root: staticPath });
                })
            } else {
                throw new Error("SPA is missing static path property");
            }
        }

        if (https && credentials === undefined) {
            throw new Error("HTTPS is turned on but certificat property is missing");
        }

        return vhost(domain, app);
    }
}
