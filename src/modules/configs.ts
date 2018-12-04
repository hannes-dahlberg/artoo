import * as fs from "fs";
import * as path from "path";

interface IConfig {
    paths: {
        storage: string,
        models: string,
        serverStaticDefaultPath: string,
        root: string,
        [key: string]: string,
    };
}

const configFileName: string = "artoo.config.json";
const defaultConfigPath: string = path.resolve(__dirname, `../../${configFileName}`);
let configPath: string = path.resolve(__dirname, `../../../../${configFileName}`);

if (!fs.existsSync(configPath)) {
    configPath = defaultConfigPath;
}

export const config: IConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
Object.keys(config.paths).forEach((key: string) => {
    config.paths[key] = path.resolve(config.paths[key].substr(0, 1) !== "/" ? `${__dirname}/../../../../` : "", config.paths[key]);
});

config.paths.root = path.resolve(__dirname, "../../../../");