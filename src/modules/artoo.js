"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yargs = require("yargs");
var migrate_1 = require("./migrate");
//import { User, Group } from '../models';
var argv = yargs.argv;
var commands = argv._.map(function (command) { return command.toLowerCase(); });
//Run migration
if (commands[0] == 'migrate') {
    migrate_1.default.migrate();
}
else if (commands[0] == 'migrate:rollback') {
    migrate_1.default.rollback();
}
else if (commands[0] == 'create:migration') {
    if (!argv.class) {
        console.error('Error: param class is missing');
    }
    else {
        migrate_1.default.create(argv.class);
    }
} /*else if(commands[0] == 'create:user') {
    if(!argv.email || !argv.password || !argv.group) { console.error('Error: param email, password and/or group is missing'); }
    else {
        let createUser = (groupId: number) => {
                User.create({ email: argv.email, password: argv.password }).then((user: User) => {
                    user.group().attach(groupId).then(() => {
                        console.log('User Created')
                    });
                }).catch((error: any) => console.log(error));
        }
        Group.where('name', argv.group).first().then((group: Group) => {
            if(group) {
                createUser(group.id);
            } else {
                Group.create({ name: argv.group }).then((group: Group) => {
                    createUser(group.id);
                })
            }
        })
    }
}*/
