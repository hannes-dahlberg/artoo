import * as yargs from 'yargs';

import { ORM, Models } from '../';
import Migrate from './migrate';

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
} else if(commands[0] == 'create:user') {
    if(!argv.email || !argv.password || !argv.group) { console.error('Error: param email, password and/or group is missing'); }
    else {
        let createUser = (groupId: number) => {
                Models.User.create<Models.User>({ email: argv.email, password: argv.password }).then(user => {
                    (<ORM.Relation<Models.Group>>user.groups()).attach(groupId).then(() => {
                        console.log('User Created');
                    });
                }).catch((error: any) => console.log(error));
        }
        Models.Group.where('name', argv.group).first().then((group: Models.Group) => {
            if(group) {
                createUser(group.id);
            } else {
                Models.Group.create<Models.Group>({ name: argv.group }).then((group: Models.Group) => {
                    createUser(group.id);
                })
            }
        })
    }
}