//Importing node modules
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { Express } from 'express';
import * as http from 'http';
import * as vhost from 'vhost';
import * as path from 'path';
import * as cors from 'cors';
import { CorsOptions, CorsOptionsDelegate } from 'cors';

import artooConfigs from './configs';
import { container } from './container';
container.set('express', express);

export type corsConfig = string | string[] | CorsOptions | CorsOptionsDelegate;

//Config interface
export type app = {
    domain: string,
    type?: 'api' | 'spa',
    corsConfig?: corsConfig,
    routes?: express.Router,
    staticPath?: string
}
export type configs = {
    port?: number,
    domain?: string,
    type?: 'api' | 'spa',
    corsConfig?: corsConfig,
    routes?: express.Router,
    staticPath?: string,
    apps?: app[]
}

export class Server {
    //Configs
    private configs: configs;

    //App
    public app: express.Express;

    constructor({
        port = 9090,
        domain = 'app.test',
        type = 'api',
        corsConfig,
        routes,
        staticPath = artooConfigs.paths.serverStaticDefaultPath,
        apps = []
    }: configs = {}) {
        //Setting configs
        this.configs = { port, type, corsConfig, domain, routes, staticPath, apps };

        //Creating the express app
        this.app = <Express>container.get<any>('express')();

        if (this.configs.apps.length == 0) {
            this.configs.apps.push({
                domain: this.configs.domain,
                type: this.configs.type,
                corsConfig: this.configs.corsConfig,
                routes: this.configs.routes,
                staticPath: this.configs.staticPath
            });
        }

        for (let a = 0; a < this.configs.apps.length; a++) {
            if (!this.configs.apps[a].staticPath) { this.configs.apps[a].staticPath = artooConfigs.paths.serverStaticDefaultPath; }

            this.app.use(this.createApp(this.configs.apps[a]));
        }
    }
    public start(): Promise<http.Server> {
        return new Promise((resolve, reject) => {
            //Start server
            let listner = this.app.listen(this.configs.port, () => {
                this.configs.apps.forEach((app) => {
                    console.log(`Serving ${app.type.toUpperCase()} on: ${app.domain}:${this.configs.port}${(app.type == 'spa' && app.staticPath) ? ` with static root: "${app.staticPath}"` : ``}`)
                });
                resolve(listner);
            });
        })
    }

    private createApp({
        type = 'api',
        domain,
        corsConfig,
        routes,
        staticPath
    }: app): vhost.RequestHandler {
        let app: express.Express = express();
        if (type == 'api') {
            if (corsConfig) {
                if (typeof corsConfig == 'string' || corsConfig instanceof Array) {
                    corsConfig = {
                        origin: corsConfig
                    };
                }
                app.use(cors(corsConfig));
            }

            //Attaching body parser
            app.use(bodyParser.urlencoded({
                extended: true
            }));

            //Parse post body as json
            app.use(bodyParser.json());

            if (routes) {
                app.use('/', routes);
            }

        } else if (type == 'spa' && staticPath) {
            app.use(express.static(staticPath));
        }

        return vhost(domain, app);
    }
}