import * as Promise from 'bluebird';
declare type migration = {
    name: string;
    path: string;
    batch: number;
};
export default class Migrate {
    static migrate(rollback?: boolean): Promise<void>;
    static rollback(): Promise<void>;
    static getMigrations(): Promise<migration[]>;
    static create(name: string): Promise<void>;
}
export {};
