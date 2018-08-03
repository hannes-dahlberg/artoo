"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//Libs
var fs = require("fs");
var path = require("path");
var Promise = require("bluebird");
//Modules
var storage_1 = require("./storage");
var helpers = require("./helpers");
var prom_1 = require("./prom");
var Migrate = /** @class */ (function () {
    function Migrate() {
    }
    Migrate.migrate = function (rollback) {
        var _this = this;
        if (rollback === void 0) { rollback = false; }
        return new Promise(function (resolve, reject) {
            _this.getMigrations().then(function (migrations) {
                //Get latest batch number from db
                var executedMigrations = migrations.filter(function (migration) { return migration.batch != null; });
                var latestBatch = executedMigrations.length ? executedMigrations[executedMigrations.length - 1].batch : 0;
                //Filter out migrations to execute
                var migrationsToExecute = migrations.filter(function (migration) { return rollback ? migration.batch == latestBatch : migration.batch == null; });
                if (!migrationsToExecute.length) {
                    console.log('Nothing to migrate');
                }
                //Execute all promises in sequence
                prom_1.Prom.sequence(migrationsToExecute.map(function (migration) { return function () { return new Promise(function (resolve, reject) {
                    //Import migration module from file
                    Promise.resolve().then(function () { return require(migration.path); }).then(function (module) {
                        //Execute up or down script depending on rollback param
                        module[rollback ? 'down' : 'up']().then(function () {
                            if (rollback) {
                                //Delete migration from database table
                                storage_1.storage.get("SELECT [id] FROM [migrations] WHERE [name] = '" + migration.name + "'").then(function (row) {
                                    storage_1.storage.delete({ table: 'migrations', id: row.id }).then(function () {
                                        console.log('Rolled backed migration ' + migration.name);
                                        resolve();
                                    }).catch(function (error) { return reject(error); });
                                }).catch(function (error) { return reject(error); });
                            }
                            else {
                                //Add migration to database table
                                storage_1.storage.insert({ table: 'migrations', data: { name: migration.name, batch: latestBatch + 1 } }).then(function () {
                                    console.log('Migrated ' + migration.name);
                                    resolve();
                                }).catch(function (error) { return reject(error); });
                            }
                        }).catch(function (error) { return reject(error); });
                    }).catch(function (error) { return reject(error); });
                }); }; }), { breakOnReject: true }).then(function (output) {
                    if (output.rejects) {
                        console.log(output.results[0].error);
                        reject(new Error('Migration error'));
                        return;
                    }
                    resolve();
                });
            });
        });
    };
    Migrate.rollback = function () {
        return this.migrate(true);
    };
    Migrate.getMigrations = function () {
        return new Promise(function (resolve, reject) {
            //Check if migration table exists
            storage_1.storage.checkTable('migrations').then(function (exists) {
                //If migration table doesn't exists. Create it
                if (!exists) {
                    storage_1.storage.db.exec("\n                        CREATE TABLE [migrations] (\n                            [id] INTEGER PRIMARY KEY,\n                            [name] VARCHAR(255),\n                            [batch] INTEGER\n                        )\n                    ", function (error) {
                        //Reject on error
                        if (error) {
                            reject(error);
                            return;
                        }
                        //Run getMigrations again (itself)
                        Migrate.getMigrations().then(function (migrations) { return resolve(migrations); }).catch(function (error) { return reject(error); });
                    });
                }
                else {
                    //Container for migrations
                    var migrations_1 = [];
                    //Get migrations in table
                    storage_1.storage.getTable('migrations').then(function (rows) {
                        //Read migration files
                        fs.readdir(path.join(__dirname, '../../storage/migrations'), function (error, files) {
                            if (error) {
                                reject(error);
                                return;
                            }
                            files.filter(function (file) { return /^.+\.js$/.test(file); }).forEach(function (file) {
                                var name = helpers.substr(file, 0, -3);
                                var matchedDBRow = rows.find(function (row) { return row.name == name; });
                                var batch = matchedDBRow ? matchedDBRow.batch : null;
                                //Add migration to migrations container
                                migrations_1.push({
                                    name: name,
                                    path: path.join('../../storage/migrations/', file),
                                    batch: batch
                                });
                            });
                            /*Check if there's migrations in the database
                            with no existing file. Reject if so*/
                            if (rows.find(function (row) { return !migrations_1.find(function (migration) { return migration.name == row.name; }); })) {
                                reject(new Error('There\'s migrations recorded as executed in the migration table but has no corresponding migration file. Migration queue is broken'));
                                return;
                            }
                            //Resolve array of migrations
                            resolve(migrations_1);
                        });
                    }).catch(function (error) { return reject(error); });
                }
            });
        });
    };
    Migrate.create = function (name) {
        return new Promise(function (resolve, reject) {
            fs.writeFile(path.join(__dirname, '../../storage/migrations/', helpers.dateFormat() + '-' + name + '.ts'), template, function (error) {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    };
    return Migrate;
}());
exports.default = Migrate;
var template = "import { storage } from '../../app/modules/storage';\n\nexport let up: () => Promise<void> = () => {\n    return new Promise((resolve, reject) => {\n        storage.execute(`\n\n        `).then(() => resolve()).catch((error: Error) => reject(error));\n    });\n}\n\nexport let down: () => Promise<void> = () => {\n    return new Promise((resolve, reject) => {\n        storage.execute(`\n\n        `).then(() => resolve()).catch((error: Error) => reject(error));\n    });\n}";
