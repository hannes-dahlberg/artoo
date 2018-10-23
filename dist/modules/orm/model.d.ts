import { entity } from '../../modules/storage';
import { Relation, relationDefinition } from './relation';
import { Statement, where, join } from './statement';
export declare type relationType = {
    model: any;
    join: join | join[];
    type: 'one' | 'many';
};
export declare type acceptedRelation = {
    relation: string;
    explicit: boolean;
};
export declare function serialize<T extends Model>(objects: T[]): any;
export declare class Model {
    static table: string;
    static fields: string[];
    static fillable: string[];
    static hidden: string[];
    static append: string[];
    id: number;
    constructor(entity?: entity);
    static where(where: where | string, value?: string): Statement<Model>;
    static whereIsNull(column: string): Statement<Model>;
    static whereIsNotNull(column: string): Statement<Model>;
    static get(): Promise<Model[]>;
    static first(): Promise<Model>;
    static exists(id?: number): Promise<Model>;
    static find(id: number): Promise<Model>;
    static create(data: any): Promise<Model>;
    static delete(entity: (number | Model) | (number | Model)[]): void;
    save(): Promise<void>;
    delete(): Promise<void>;
    fill(data: any, acceptedRelations?: string | acceptedRelation | (string | acceptedRelation | acceptedRelation[])[]): Promise<void>;
    serialize(): any;
    protected hasMany<T extends Model>(model: new () => T, columnKey: string): Relation<Model> | relationType;
    protected belongsTo<T extends Model>(model: new () => T, columnKey: string): Relation<Model> | relationType;
    protected belongsToMany<T extends Model>(model: new () => T, pivotTable: string, firstColumnKey: string, secondColumnKey: string): Relation<Model> | relationType;
    static getRelation(relation: string): relationType;
    static getRelations(): {
        [key: string]: relationType;
    };
    static with(relations: string | string[], statement?: Statement<Model>, parent?: string): Statement<Model>;
    static getStatement(): Statement<Model>;
    static getRelationStatement(relationInfo: relationDefinition): Relation<Model>;
    static getSelf(): any;
    static getInstance(): Model;
    static readonly statement: string;
}
