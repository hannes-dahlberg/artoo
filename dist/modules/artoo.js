"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yargs = require("yargs");
var migrate_1 = require("./migrate");
var argv = yargs.argv;
var commands = argv._.map(function (command) { return command.toLowerCase(); });
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
}
