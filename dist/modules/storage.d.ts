import * as sqlite3 from 'sqlite3';
import { Singleton } from './singleton';
export declare type entity = {
    [key: string]: any;
};
export declare type tableDirective = string;
export declare type selectDirective = string;
export declare type whereDirective = string | [string, string, string | number] | {
    column: string;
    operator: string;
    value: string | number;
};
export declare type orderByDirective = string | [string, boolean] | {
    column: string;
    desc: boolean;
};
export declare type limitDiretive = number | [number, number];
declare class Storage extends Singleton {
    db: sqlite3.Database;
    private constructor();
    checkTable(tableName: string): Promise<boolean>;
    getFromId({ table, id }: {
        table: string;
        id: number;
    }): Promise<entity>;
    getTable(table: string): Promise<entity[]>;
    get(statement: string): Promise<entity>;
    getAll(statement: string): Promise<entity>;
    insert({ table, data }: {
        table: string;
        data: entity | entity[];
    }): Promise<entity>;
    update({ data, table, alternateKey, noKey }: {
        data: entity | entity[];
        table: string;
        alternateKey?: {
            name: string;
            value: string;
        };
        noKey?: boolean;
    }): Promise<entity | void>;
    delete({ table, id, alternateKey }: {
        table: string;
        id?: number | number[];
        alternateKey?: {
            name: string;
            value: string | string[];
        };
    }): Promise<void>;
    execute(query: string): Promise<void>;
    private entityKeys;
    private entityValues;
    private entitySetValues;
    private parseValue;
}
export declare let storage: Storage;
export {};
