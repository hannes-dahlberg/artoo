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

export const configs: IConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
Object.keys(configs.paths).forEach((key: string) => {
    configs.paths[key] = path.resolve(configs.paths[key].substr(0, 1) !== "/" ? `${__dirname}/../../../../` : "", configs.paths[key]);
});

configs.paths.root = path.resolve(__dirname, "../../../../");
