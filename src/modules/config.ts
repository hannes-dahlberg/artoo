// Libs
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

//Modules
import { Singleton } from './singleton';
import artooConfigs from './configs';


class Config extends Singleton {
  private vars: { [key:string]: string } = {};

  public constructor() {
    super();

    let configPath = path.resolve(artooConfigs.paths.root, '.env');
    if(fs.existsSync(configPath)) {
      this.vars = dotenv.parse(fs.readFileSync(configPath));
    }
  }

  public get(name: string, defaultValue: string = ''): string {
    if(this.vars[name]) { return this.vars[name] }

    return defaultValue;
  }
}

export let config = Config.getInstance<Config>();