// Libs
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Modules
import { configs as artooConfigs } from "../modules/configs.module";

export class ConfigService {
  private vars: { [key: string]: string } = {};

  public constructor() {
    const configPath = path.resolve(artooConfigs.paths.root, ".env");
    if (fs.existsSync(configPath)) {
      this.vars = dotenv.parse(fs.readFileSync(configPath));
    }
  }

  public get(name: string, defaultValue: string = ""): string {
    if (this.vars[name]) { return this.vars[name]; }

    return defaultValue;
  }
}
