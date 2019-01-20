import * as ejs from "ejs";
import * as path from "path";
import * as fs from "fs";
import * as changeCase from "change-case";

const SCAFFOLD_PATH = path.resolve(__dirname, "../../scaffold");
const TEMPLATES = {
  controller: { in: "api/controllers/controller.ejs", out: "api/controllers/%NAME%.controller.ts", },
  model: { in: "api/models/model.ejs", out: "api/models/%NAME%.model.ts" },
  dto: { in: "shared/dto/dto.ejs", out: "shared/dto/%NAME%.dto.ts" },
  component: { in: "spa/src/ts/components/component.vue.ejs", out: "spa/src/ts/components/%NAME%.component.vue" },
  "package.json": { in: "package.json.ejs", out: "./package.json" }
}

export type templateKey = keyof typeof TEMPLATES;

export class TemplateGeneratorService {
  public generate(template: templateKey, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      ejs.renderFile(path.resolve(SCAFFOLD_PATH, TEMPLATES[template].in), {
        changeCase,
        name
      }, (error: any, result: string) => {
        if (error) { reject(error); return; }
        fs.writeFile(path.resolve(TEMPLATES[template].out.replace("%NAME%", changeCase.paramCase(name))), result, "utf-8", (error: any) => {
          if (error) { reject(error); return; }
          resolve();
        });
      });

    });
  }
}