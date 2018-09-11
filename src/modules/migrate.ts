//Libs
import * as fs from 'fs';
import * as path from 'path';
import * as Promise from 'bluebird';

//Modules
import { storage, helpers, Prom, prom } from '../';
import artooConfigs from './configs';

const migrationPath = path.join(artooConfigs.paths.storage, 'migrations');

type migration = {
    name: string,
    path: string,
    batch: number
}

export default class Migrate {
    static migrate(rollback: boolean = false): Promise<void> {
        return new Promise((resolve, reject) => {
            this.getMigrations().then((migrations: migration[]) => {
                //Get latest batch number from db
                let executedMigrations = migrations.filter((migration: migration) => migration.batch != null)
                let latestBatch: number = executedMigrations.length ? executedMigrations[executedMigrations.length - 1].batch : 0;
                //Filter out migrations to execute
                let migrationsToExecute = migrations.filter((migration: migration) => rollback ? migration.batch == latestBatch : migration.batch == null);

                if(!migrationsToExecute.length) {
                    console.log('Nothing to migrate');
                }

                //Execute all promises in sequence
                Prom.sequence(migrationsToExecute.map((migration: migration) => () => new Promise((resolve, reject) => {
                    //Import migration module from file
                    import(migration.path).then((module: any) => {
                        //Execute up or down script depending on rollback param
                        module[rollback ? 'down' : 'up']().then(() => {
                            if(rollback) {
                                //Delete migration from database table
                                storage.instance.get(`SELECT [id] FROM [migrations] WHERE [name] = '` + migration.name + `'`).then((row: storage.entity) => {
                                    storage.instance.delete({ table: 'migrations', id: row.id }).then(() => {
                                        console.log('Rolled backed migration ' + migration.name);
                                        resolve();
                                    }).catch((error: Error) => reject(error));
                                }).catch((error: Error) => reject(error));
                            } else {
                                //Add migration to database table
                                storage.instance.insert({ table: 'migrations', data: { name: migration.name, batch: latestBatch + 1 } }).then(() => {
                                    console.log('Migrated ' + migration.name);
                                    resolve();
                                }).catch((error: Error) => reject(error));
                            }
                        }).catch((error: Error) => reject(error));
                    }).catch((error: Error) => reject(error));
                })), { breakOnReject: true }).then((output: prom.output) => {
                    if(output.rejects) { console.log(output.results[0].error); reject(new Error('Migration error')); return; }

                    resolve();
                });
            });
        });
    }
    static rollback(): Promise<void> {
        return this.migrate(true);
    }
    static getMigrations(): Promise<migration[]> {
        return new Promise((resolve, reject) => {
            //Check if migration table exists
            storage.instance.checkTable('migrations').then(exists => {
                //If migration table doesn't exists. Create it
                if(!exists) {
                    storage.instance.db.exec(`
                        CREATE TABLE [migrations] (
                            [id] INTEGER PRIMARY KEY,
                            [name] VARCHAR(255),
                            [batch] INTEGER
                        )
                    `, (error: Error) => {
                        //Reject on error
                        if(error) { reject(error); return; }
                        //Run getMigrations again (itself)
                        Migrate.getMigrations().then((migrations: migration[]) => resolve(migrations)).catch((error: any) => reject(error));
                    });
                } else {
                    //Container for migrations
                    let migrations: migration[] = [];

                    //Get migrations in table
                    storage.instance.getTable('migrations').then((rows: storage.entity[]) => {
                        //Read migration files
                        fs.readdir(migrationPath,
                            (error: any, files: string[]) => {
                                if(error) { reject(error); return; }
                                files.filter((file: string) => /^.+\.js$/.test(file)).forEach((file: string) => {
                                    let name = helpers.substr(file, 0, -3);
                                    let matchedDBRow = rows.find((row: storage.entity) => row.name == name);
                                    let batch: number = matchedDBRow ? matchedDBRow.batch : null;
                                    //Add migration to migrations container
                                    migrations.push({
                                        name,
                                        path: path.join(migrationPath, file),
                                        batch
                                    });
                                });

                                /*Check if there's migrations in the database
                                with no existing file. Reject if so*/
                                if(rows.find((row: storage.entity) => !migrations.find((migration: migration) => migration.name == row.name))) {
                                    reject(new Error('There\'s migrations recorded as executed in the migration table but has no corresponding migration file. Migration queue is broken'));
                                    return;
                                }

                                //Resolve array of migrations
                                resolve(migrations);
                            });
                    }).catch((error: Error) => reject(error));
                }
            });
        });
    }
    static create(name: string): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(path.join(migrationPath,  helpers.dateFormat() + '-' + name + '.ts'),
                template,
                (error: any) => {
                    if(error) { reject(error); return; }
                    resolve();
                });
        });
    }
}

let template: string = `import { storage } from '../../app/modules/storage';

export let up: () => Promise<void> = () => {
    return new Promise((resolve, reject) => {
        storage.execute(\`

        \`).then(() => resolve()).catch((error: Error) => reject(error));
    });
}

export let down: () => Promise<void> = () => {
    return new Promise((resolve, reject) => {
        storage.execute(\`

        \`).then(() => resolve()).catch((error: Error) => reject(error));
    });
}`