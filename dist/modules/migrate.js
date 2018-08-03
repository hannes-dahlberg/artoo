"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var Promise = require("bluebird");
var storage_1 = require("./storage");
var helpers = require("./helpers");
var prom_1 = require("./prom");
var Migrate = (function () {
    function Migrate() {
    }
    Migrate.migrate = function (rollback) {
        var _this = this;
        if (rollback === void 0) { rollback = false; }
        return new Promise(function (resolve, reject) {
            _this.getMigrations().then(function (migrations) {
                var executedMigrations = migrations.filter(function (migration) { return migration.batch != null; });
                var latestBatch = executedMigrations.length ? executedMigrations[executedMigrations.length - 1].batch : 0;
                var migrationsToExecute = migrations.filter(function (migration) { return rollback ? migration.batch == latestBatch : migration.batch == null; });
                if (!migrationsToExecute.length) {
                    console.log('Nothing to migrate');
                }
                prom_1.Prom.sequence(migrationsToExecute.map(function (migration) { return function () { return new Promise(function (resolve, reject) {
                    Promise.resolve().then(function () { return require(migration.path); }).then(function (module) {
                        module[rollback ? 'down' : 'up']().then(function () {
                            if (rollback) {
                                storage_1.storage.get("SELECT [id] FROM [migrations] WHERE [name] = '" + migration.name + "'").then(function (row) {
                                    storage_1.storage.delete({ table: 'migrations', id: row.id }).then(function () {
                                        console.log('Rolled backed migration ' + migration.name);
                                        resolve();
                                    }).catch(function (error) { return reject(error); });
                                }).catch(function (error) { return reject(error); });
                            }
                            else {
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
            storage_1.storage.checkTable('migrations').then(function (exists) {
                if (!exists) {
                    storage_1.storage.db.exec("\n                        CREATE TABLE [migrations] (\n                            [id] INTEGER PRIMARY KEY,\n                            [name] VARCHAR(255),\n                            [batch] INTEGER\n                        )\n                    ", function (error) {
                        if (error) {
                            reject(error);
                            return;
                        }
                        Migrate.getMigrations().then(function (migrations) { return resolve(migrations); }).catch(function (error) { return reject(error); });
                    });
                }
                else {
                    var migrations_1 = [];
                    storage_1.storage.getTable('migrations').then(function (rows) {
                        fs.readdir(path.join(__dirname, '../../storage/migrations'), function (error, files) {
                            if (error) {
                                reject(error);
                                return;
                            }
                            files.filter(function (file) { return /^.+\.js$/.test(file); }).forEach(function (file) {
                                var name = helpers.substr(file, 0, -3);
                                var matchedDBRow = rows.find(function (row) { return row.name == name; });
                                var batch = matchedDBRow ? matchedDBRow.batch : null;
                                migrations_1.push({
                                    name: name,
                                    path: path.join('../../storage/migrations/', file),
                                    batch: batch
                                });
                            });
                            if (rows.find(function (row) { return !migrations_1.find(function (migration) { return migration.name == row.name; }); })) {
                                reject(new Error('There\'s migrations recorded as executed in the migration table but has no corresponding migration file. Migration queue is broken'));
                                return;
                            }
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
