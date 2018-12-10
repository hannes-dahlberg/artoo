import * as yargs from "yargs";

import { GroupModel } from "../models/group.model";
import { UserModel } from "../models/user.model";
import { MigrateModule } from "./migrate.module";
import { RelationModule } from "./orm/relation.module";

const argv = yargs.argv;
const commands = argv._.map((command: string) => command.toLowerCase());

// Run migration
if (commands[0] === "migrate") {
    MigrateModule.migrate();
} else if (commands[0] === "migrate:rollback") {
    MigrateModule.rollback();
} else if (commands[0] === "create:migration") {
    if (!argv.class) { console.error("Error: param class is missing"); } else {
        MigrateModule.create(argv.class);
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
        GroupModel.where("name", argv.group).first().then((groupModel: GroupModel) => {
            if (groupModel) {
                createUser(groupModel.id);
            } else {
                GroupModel.create<GroupModel>({ name: argv.group }).then((groupModel: GroupModel) => {
                    createUser(groupModel.id);
                });
            }
        });
    }
} /*else if (commands[0] === "scaffold") {

}*/
