"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var configFileName = 'artoo.config.json';
var defaultConfigPath = path.resolve(__dirname, "../../" + configFileName);
var configPath = path.resolve(__dirname, "../../../../" + configFileName);
if (fs.existsSync(configPath)) {
}
else {
    configPath = defaultConfigPath;
}
var config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
Object.keys(config.paths).forEach(function (key) {
    config.paths[key] = path.resolve(config.paths[key].substr(0, 1) != '/' ? '../../' : '', config.paths[key]);
});
exports.default = config;
