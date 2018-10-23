"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bodyParser = require("body-parser");
var express = require("express");
var vhost = require('vhost');
var configs_1 = require("./configs");
var Server = (function () {
    function Server(_a) {
        var _b = _a.port, port = _b === void 0 ? 9090 : _b, _c = _a.type, type = _c === void 0 ? 'api' : _c, _d = _a.domain, domain = _d === void 0 ? 'app.test' : _d, _e = _a.routes, routes = _e === void 0 ? null : _e, _f = _a.staticPath, staticPath = _f === void 0 ? configs_1.default.paths.serverStaticDefaultPath : _f, _g = _a.apps, apps = _g === void 0 ? [] : _g;
        this.configs = { port: port, type: type, domain: domain, routes: routes, staticPath: staticPath, apps: apps };
        this.app = express();
        if (this.configs.apps.length == 0) {
            this.configs.apps.push({
                domain: this.configs.domain,
                type: this.configs.type,
                routes: this.configs.routes,
                staticPath: this.configs.staticPath
            });
        }
        for (var a = 0; a < this.configs.apps.length; a++) {
            if (!this.configs.apps[a].staticPath) {
                this.configs.apps[a].staticPath = configs_1.default.paths.serverStaticDefaultPath;
            }
            this.app.use(this.createApp(this.configs.apps[a]));
        }
    }
    Server.prototype.start = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.app.listen(_this.configs.port, function () {
                _this.configs.apps.forEach(function (app) {
                    console.log("Serving " + app.type.toUpperCase() + " on: " + app.domain + ":" + _this.configs.port + ((app.type == 'spa' && app.staticPath) ? " with static root: \"" + app.staticPath + "\"" : ""));
                });
                resolve();
            });
        });
    };
    Server.prototype.createApp = function (_a) {
        var _b = _a.type, type = _b === void 0 ? 'api' : _b, domain = _a.domain, routes = _a.routes, staticPath = _a.staticPath;
        var app = express();
        if (type == 'api') {
            this.app.use(bodyParser.urlencoded({
                extended: true
            }));
            this.app.use(bodyParser.json());
            if (this.configs.routes) {
                this.app.use('/', this.configs.routes);
            }
        }
        else if (type == 'spa') {
            app.use(express.static(staticPath));
        }
        return vhost(domain, app);
    };
    return Server;
}());
exports.Server = Server;
