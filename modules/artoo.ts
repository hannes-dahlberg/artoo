import * as yargs from 'yargs';

import Migrate from './migrate';
//import { User, Group } from '../models';

let argv = yargs.argv;
let commands = argv._.map((command: string) => command.toLowerCase());

//Run migration
if(commands[0] == 'migrate') {
    Migrate.migrate();
} else if(commands[0] == 'migrate:rollback') {
    Migrate.rollback();
} else if(commands[0] == 'create:migration') {
    if(!argv.class) { console.error('Error: param class is missing'); }
    else {
        Migrate.create(argv.class);
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