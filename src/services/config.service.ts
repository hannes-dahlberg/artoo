// Libs
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

export class ConfigService {
  private vars: { [key: string]: string } = {};

  public constructor() {
    const configPath = path.resolve(".env");
    if (fs.existsSync(configPath)) {
      this.vars = dotenv.parse(fs.readFileSync(configPath));
    }
  }

  public get(name: string, defaultValue: string = ""): string {
    if (this.vars[name]) { return this.vars[name]; }

    return defaultValue;
  }
}
