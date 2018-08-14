import * as fs from 'fs';
import * as path from 'path';

interface config {
    paths: {
        storage: string,
        models: string,
        serverStaticDefaultPath: string,
        [key:string]: string
    }
}

let configFileName: string = 'artoo.config.json';
let defaultConfigPath: string = path.resolve(__dirname, `../../${configFileName}`);
let configPath: string = path.resolve(__dirname, `../../../../${configFileName}`);

if(fs.existsSync(configPath)) {
} else {
    configPath = defaultConfigPath;
}

let config: config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
Object.keys(config.paths).forEach((key: string) => {
    config.paths[key] = path.resolve(config.paths[key].substr(0, 1) != '/' ? `${__dirname}/../../../../` : '', config.paths[key])
});

export default config;