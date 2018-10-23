import { Model } from './Model';
import { entity } from '../../modules/storage';
export declare type select = {
    table: string;
    column: string;
    as?: string;
} | string;
export declare type where = {
    table?: string;
    column: string;
    operator?: string;
    value: string;
};
export declare type whereNull = {
    table?: string;
    column: string;
    condition: 'NULL' | 'NOT NULL';
};
export declare type join = {
    table: string;
    alias?: string;
    sourceTable?: string;
    firstColumn: string;
    secondColumn: string;
};
export declare type orderBy = {
    table?: string;
    column: string;
    desc?: boolean;
};
export declare class Statement<T extends Model> {
    private model;
    protected table: string;
    protected fields: string[];
    constructor(model: typeof Model, table?: string, fields?: string[]);
    private selects;
    private wheres;
    private whereNulls;
    private joins;
    private orderBys;
    select(selects: select[] | select | 'self'): Statement<T>;
    where(where: where | string, value?: string): Statement<T>;
    whereIsNull(column: string): Statement<T>;
    whereIsNotNull(column: string): Statement<T>;
    private whereNull;
    orderBy(orderBy: string | orderBy, desc?: boolean): Statement<T>;
    find(id: number): Promise<T>;
    join(join: join): Statement<T>;
    scope(name: string, ...params: any[]): Statement<T>;
    readonly statement: string;
    get(): Promise<T[]>;
    first(): Promise<T>;
    exists(id?: number): Promise<T>;
    insert(data: entity): Promise<entity>;
    update(data: entity): Promise<entity>;
    delete(id: number): Promise<void>;
}
