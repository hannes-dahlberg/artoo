import * as fs from "fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import * as sqlite3 from "sqlite3";

import { container } from "../modules/container.module";
import { ConfigService } from "./config.service";

const configService: ConfigService = container.getService(ConfigService);

export interface IStorageEntity { [key: string]: any; }

export type tableDirective = string;
export type selectDirective = string;
export type whereDirective = string | [string, string, string | number] | { column: string, operator: string, value: string | number };
export type orderByDirective = string | [string, boolean] | { column: string, desc: boolean };
export type limitDiretive = number | [number, number];

export class StorageService {
    public db: sqlite3.Database;

    public constructor() {
        const dbDir = configService.get("STORAGE_PATH", "storage");
        const dbPath = path.resolve(configService.get("STORAGE_PATH", "storage"), "db.sqlite");
        if (!fs.existsSync(dbPath)) {
            try {
                mkdirp.sync(dbDir);
                fs.openSync(dbPath, "w");
            } catch (error) { throw new Error(`Unable to read and/or create dabase file at path: "${dbPath}"`); }
        }
        this.db = new (sqlite3.verbose()).Database(dbPath, sqlite3.OPEN_READWRITE ? sqlite3.OPEN_READWRITE : sqlite3.OPEN_CREATE);
    }

    public checkTable(tableName: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const query = `SELECT COUNT(*) as [count] FROM sqlite_master WHERE name = '` + tableName + `' and type = 'table'`;
            this.db.get(query, (error: Error, result: any) => {
                if (error) { error.message += ` QUERY:"${query}"`; reject(error); return; }
                resolve(!!result.count);
            });
        });
    }

    public getFromId({ table, id }: { table: string, id: number }): Promise<IStorageEntity> {
        return new Promise((resolve, reject) => {
            // Get row from table with provided id
            const query = `SELECT * FROM [` + table + `] WHERE id = ` + id;
            this.db.get(query, (error: Error, row: any) => {
                // Reject on error
                if (error) { error.message += ` QUERY:"${query}"`; reject(error); return; }

                // Resolve row
                resolve(row);
            });
        });
    }

    public getTable(table: string): Promise<IStorageEntity[]> {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM [` + table + `]`;
            this.db.all(query, (error: Error, rows: any[]) => {
                if (error) { error.message += ` QUERY:"${query}"`; reject(error); return; }
                resolve(rows);
            });
        });
    }

    public get(statement: string): Promise<IStorageEntity> {
        return new Promise((resolve, reject) => {
            this.db.get(statement, (error: Error, row: any) => {
                if (error) { error.message += ` QUERY:"${statement}"`; reject(error); return; }
                resolve(row);
            });
        });
    }

    public getAll(statement: string): Promise<IStorageEntity[]> {
        return new Promise((resolve, reject) => {
            this.db.all(statement, (error: Error, rows: any[]) => {
                if (error) { error.message += ` QUERY:"${statement}"`; reject(error); return; }
                resolve(rows);
            });
        });
    }

    public count(statement: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.getAll(statement).then((rows: IStorageEntity[]) => {
                if (rows.length === 1) {
                    const keys = Object.keys(rows[0]);
                    if (keys.length === 1) { resolve(parseInt(rows[0][keys[0]], 10)); return; }
                    resolve(1);
                    return;
                }
                resolve(rows.length);
            }).catch((error: any) => reject(error));
        });
    }

    public insert({ table, data }: { table: string, data: IStorageEntity | IStorageEntity[] }): Promise<IStorageEntity> {
        return new Promise((resolve, reject) => {
            // Convert to array if not
            if (!(data instanceof Array)) { data = [data]; }

            // Set this to _self
            const self = this;
            // Run insert statement
            const query = `INSERT INTO [` + table + `] (` + this.entityKeys((data as IStorageEntity[])[0]) + `) VALUES (` + (data as IStorageEntity[]).map((d: IStorageEntity) => this.entityValues(d)).join("), (") + `)`;
            this.db.run(query, function (error: Error) {
                // Reject on error
                if (error) { error.message += ` QUERY:"${query}"`; reject(error); return; }
                // Resolve inserted row
                self.getFromId({ table, id: this.lastID }).then((row: IStorageEntity) => resolve(row)).catch((error: any) => reject(error));
            });
        });
    }
    public update({ data, table, alternateKey = null, noKey = false }: { data: IStorageEntity | IStorageEntity[], table: string, alternateKey?: { name: string, value: string }, noKey?: boolean }): Promise<IStorageEntity | void> {
        return new Promise((resolve, reject) => {
            // Convert data to array
            if (!(data instanceof Array)) { data = [data]; }

            /*Reject if any rows is missing ID and noKey and alternateKey is not
            set*/
            if (!noKey && !alternateKey && (data as IStorageEntity[]).findIndex((entity: IStorageEntity) => !entity.id) !== -1) {
                reject(new Error("provided data has no ID value")); return;
            }

            let statement = "";
            (data as IStorageEntity[]).forEach((entity: IStorageEntity) => {
                statement += `UPDATE [${table}] SET ${this.entitySetValues(entity)} ${(!noKey ? `WHERE [${(alternateKey ? alternateKey.name : `id`)}] = ${(alternateKey ? alternateKey.value : entity.id.toString())}` : ``)}; `;
            });

            // Run update statement
            this.db.exec(statement, (error: Error) => {
                // Reject on error
                if (error) { error.message += ` QUERY:"${statement}"`; reject(error); return; }

                if (!noKey && !alternateKey && (data as IStorageEntity[]).length === 1) {
                    // Resolve updated row
                    this.getFromId({ table, id: (data as IStorageEntity[])[0].id }).then((row: IStorageEntity) => resolve(row)).catch((e: Error) => reject(e));
                    return;
                }

                resolve();
            });
        });
    }
    public delete({ table, id = null, alternateKey = null }: { table: string, id?: number | number[], alternateKey?: { name: string, value: string | string[] } }): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!id && !alternateKey) {
                reject("ID is missing"); return;
            }
            const key = id ? "id" : alternateKey.name;
            const value: string | string[] = id ? (id instanceof Array ? id.map((i: number) => i.toString()) : id.toString()) : alternateKey.value.toString();
            // Run delete statement
            const query = `DELETE FROM [${table}] where [${key}] ${(typeof value === "string" ? ` = '${value}'` : ` IN(${value.join(", ")})`)}`;
            this.db.run(query, (error: Error) => {
                // Reject on error
                if (error) { error.message += ` QUERY:"${query}"`; reject(error); return; }

                // Resolve on success
                resolve();
            });
        });
    }

    public execute(query: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.exec(query, (error: Error) => {
                if (error) { error.message += ` QUERY:"${query}"`; reject(error); return; }
                resolve();
            });
        });
    }

    private entityKeys(data: IStorageEntity): string {
        return Object.keys(data).map((key) => `[${key}]`).join(", ");
    }
    private entityValues(data: IStorageEntity): string {
        return Object.keys(data).map((key) => `${this.parseValue(data[key])}`).join(", ");
    }
    private entitySetValues(data: IStorageEntity): string {
        return Object.keys(data).map((key) => `[${key}] = ${this.parseValue(data[key])}`).join(", ");
    }
    private parseValue(value: any): string {
        if (value === null) {
            return `NULL`;
        } else if (typeof value === "number") {
            return `${value}`;
        } else {
            return `'${value}'`;
        }
    }
}
