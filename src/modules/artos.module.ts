import * as yargs from "yargs";
import * as childProcess from "child_process";
import * as path from "path";
import * as changeCase from "change-case";

import { GroupModel } from "../models/group.model";
import { UserModel } from "../models/user.model";
import { MigrateModule } from "./migrate.module";
import { RelationModule } from "./orm/relation.module";
import { TemplateGeneratorService, templateKey } from "../services/template-generator.service";
import { container } from "./container.module";

const templateGeneratorService: TemplateGeneratorService = container.getService(TemplateGeneratorService);

const argv = yargs.argv;
const commands = argv._.map((command: string) => command.toLowerCase());

// Run migration
if (commands[0] === "migrate") {
    MigrateModule.migrate().then(() => {
        console.log("Migration complete");
    }).catch((error: any) => {
        console.log("Migration failed with error", error)
    });
} else if (commands[0] === "migrate:rollback") {
    MigrateModule.rollback();
} else if (commands[0] === "create:migration") {
    if (!argv.class) { console.error("Error: param class is missing"); } else {
        MigrateModule.create(argv.class as string);
    }
} else if (commands[0] === "create:user") {
    if (!argv.email || !argv.password || !argv.group) { console.error("Error: param email, password and/or group is missing"); } else {
        const createUser = (groupId: number) => {
            UserModel.create<UserModel>({ email: argv.email, password: argv.password }).then((user) => {
                (user.groups() as RelationModule<GroupModel>).attach(groupId).then(() => {
                    console.log("User Created");
                });
            }).catch((error: any) => console.log(error));
        };
        GroupModel.where("name", argv.group as string).first().then((groupModel: GroupModel) => {
            if (groupModel) {
                createUser(groupModel.id);
            } else {
                GroupModel.create<GroupModel>({ name: argv.group }).then((groupModel: GroupModel) => {
                    createUser(groupModel.id);
                });
            }
        });
    }
} else if (commands[0] === "scaffold") {
    if (!argv.name) { console.error("Param name was missing"); } else {
        const appRoot = process.cwd();
        const scaffoldPath = path.relative(appRoot, path.resolve(__dirname, "../../scaffold"));
        const command = `
            rsync
                -r
                ${scaffoldPath}/
                ${appRoot}/
                --exclude=.cache
                --exclude=build
                --exclude=node_modules
                --exclude=storage/migrations/*.js
                --exclude=storage/db.sqlite
                --exclude=.env
                --exclude=package.json
                --exclude=**/*.ejs
        `.replace(/\n/g, "");
        childProcess.exec(command, (error: any) => {
            if (error) { console.log("Was unable to copy scaffold folder", error); return; }
            templateGeneratorService.generate("package.json", argv.name as string).then(() => {
                console.log("Scaffold complete!");
            }).catch((error: any) => {
                console.log("was unable to generate package.json file", error);
            });
        });
    }
} else if (["generate:controller", "generate:model", "generate:dto", "generate:component"].indexOf(commands[0]) !== -1) {
    if (!argv.name) { console.error("Param name was missing"); } else {
        const command = commands[0].split(":")[1];
        templateGeneratorService.generate(command as templateKey, argv.name as string).then(() => {
            console.log(`${changeCase.ucFirst(command)} generated!`);
        }).catch((error: any) => {
            console.log(`Was unable to generate ${command}`, error);
        });
    }
}
