import * as sqlite3 from 'sqlite3';
import * as path from 'path';

import { Singleton } from './singleton';
import artooConfigs from './configs';

export type entity = { [key:string]: any };

export type tableDirective = string;
export type selectDirective = string;
export type whereDirective = string|[string, string, string|number]|{ column: string, operator: string, value: string|number}
export type orderByDirective = string|[string, boolean]|{ column: string, desc: boolean }
export type limitDiretive = number|[number, number];

export class Storage extends Singleton {
    public db: sqlite3.Database;

    private constructor() {
        super();
        this.db = new (sqlite3.verbose()).Database(path.resolve(artooConfigs.paths.storage, 'db.sqlite'), sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE);
    }

    public checkTable(tableName: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT COUNT(*) as [count] FROM sqlite_master WHERE name = '` + tableName + `' and type = 'table'`, (error: Error, result: any) => {
                if(error) { reject(error); return; }
                resolve(!!result.count);
            });
        });
    }

    public getFromId({ table, id }: { table: string, id: number }): Promise<entity> {
        return new Promise((resolve, reject) => {
            //Get row from table with provided id
            this.db.get(`SELECT * FROM [` + table + `] WHERE id = ` + id, (error: Error, row: any) => {
                //Reject on error
                if(error) { reject(error); return; }

                //Resolve row
                resolve(row);
            });
        })
    }

    public getTable(table: string): Promise<entity[]> {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM [` + table + `]`, (error: Error, rows: any[]) => {
                if(error) { reject(error); return; }
                resolve(rows);
            });
        });
    }

    public get(statement: string): Promise<entity> {
        return new Promise((resolve, reject) => {
            this.db.get(statement, (error: Error, row: any) => {
                if(error) { reject(error); return; }
                resolve(row);
            })
        });
    }

    public getAll(statement: string): Promise<entity> {
        return new Promise((resolve, reject) => {
            this.db.all(statement, (error: Error, rows: any[]) => {
                if(error) { reject(error); return; }
                resolve(rows);
            })
        })
    }

    public insert({ table, data }: { table: string, data: entity|entity[] }): Promise<entity> {
        return new Promise((resolve, reject) => {
            //Convert to array if not
            if(!(data instanceof Array)) { data = [data]; }

            //Set this to _self
            let _self = this;
            //Run insert statement
            this.db.run(`INSERT INTO [` + table + `] (` + this.entityKeys((<entity[]>data)[0]) + `) VALUES(` + (<entity[]>data).map((data: entity) => this.entityValues(data)).join(' VALUES(') + `)`, function(error: Error) {
                //Reject on error
                if(error) { reject(error); return; }

                //Resolve inserted row
                _self.getFromId({ table, id: this.lastID }).then((row: entity) => resolve(row)).catch((error: Error) => reject(error));
            });
        });
    }
    public update({ data, table, alternateKey = null, noKey = false }: { data: entity|entity[], table: string, alternateKey?: { name: string, value: string}, noKey?: boolean }): Promise<entity|void> {
        return new Promise((resolve, reject) => {
            //Convert data to array
            if(!(data instanceof Array)) { data = [data]; }

            /*Reject if any rows is missing ID and noKey and alternateKey is not
            set*/
            if(!noKey && !alternateKey && (<entity[]>data).findIndex((entity: entity) => !entity.id) != -1) {
                reject(new Error('provided data has no ID value')); return;
            }

            let statement = '';
            (<entity[]>data).forEach((entity: entity) => {
                statement += `UPDATE [${table}] SET ${this.entitySetValues(entity)} ${(!noKey ? `WHERE [${(alternateKey ? alternateKey.name : `id`)}] = ${(alternateKey ? alternateKey.value : entity.id.toString())}` : ``)}; `;
            });

            //Run update statement
            this.db.exec(statement, (error: Error) => {
                //Reject on error
                if(error) { reject(error); return; }

                if(!noKey && !alternateKey && (<entity[]>data).length == 1) {
                    //Resolve updated row
                    this.getFromId({ table, id: (<entity[]>data)[0].id }).then((row: entity) => resolve(row)).catch((error: Error) => reject(error));
                    return;
                }

                resolve();
            });
        });
    }
    public delete({ table, id = null, alternateKey = null }: { table: string, id?: number|number[], alternateKey?: { name: string, value: string|string[] } }): Promise<void> {
        return new Promise((resolve, reject) => {
            if(!id && !alternateKey) {
                reject('ID is missing'); return;
            }
            let key = id ? 'id' : alternateKey.name;
            let value: string|string[] = id ? (id instanceof Array ? id.map((id) => id.toString()) : id.toString()) : alternateKey.value;
            //Run delete statement
            this.db.run(`DELETE FROM [${table}] where [${key}] ${(typeof value == 'string' ? ` = '${value}'` : ` IN(${value.join(', ')})`)}`, (error: Error) => {
                //Reject on error
                if(error) { reject(error); return; }

                //Resolve on success
                resolve();
            });
        });
    }

    public execute(query: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.exec(query, (error: Error) => {
                if(error) { reject(error); return; }
                resolve();
            })
        });
    }

    private entityKeys(data: entity): string {
        return Object.keys(data).map(key => `[${key}]`).join(', ');
    }
    private entityValues(data: entity): string {
        return Object.keys(data).map(key => `${this.parseValue(data[key])}`).join(', ');
    }
    private entitySetValues(data: entity): string {
        return Object.keys(data).map(key => `[${key}] = ${this.parseValue(data[key])}`).join(', ');
    }
    private parseValue(value: any): string {
        if(value === null) {
            return `NULL`;
        } else if (typeof value == 'number') {
            return `${value}`;
        } else {
            return `'${value}'`;
        }
    }
}

export let instance = Storage.getInstance<Storage>();