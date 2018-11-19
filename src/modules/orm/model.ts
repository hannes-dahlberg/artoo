//Libs
import * as BluebirdPromise from 'bluebird';

//Modules
import { Relation, type as relationType, definition as relationDefinition } from './relation';
import { Statement, where, join } from './statement';
import { Prom, mode as promMode, output as promOutput } from '../prom';
import { instance as storageInstance, entity as storageEntity } from '../storage';
import * as helpers from '../helpers';


export type acceptedRelation = { relation: string, explicit: boolean }

export function serialize<T extends Model>(objects: T[]): any {
    return objects.map((object) => object.serialize());
}

export class Model {
    public static table: string;
    public static fields: string[];
    public static fillable: string[] = [];
    public static hidden: string[] = [];
    public static append: string[] = [];

    public id: number;

    constructor(entity: storageEntity = {}) {
        Object.keys(entity).forEach((key: string) => {
            (<any>this)[key] = entity[key];
        });
    }

    public static where<T extends Model>(where: where|string, value?: string): Statement<T> {
        return this.getStatement<T>().where(where, value);
    }
    public static whereIsNull<T extends Model>(column: string): Statement<T> {
        return this.getStatement<T>().whereIsNull(column);
    }
    public static whereIsNotNull<T extends Model>(column: string): Statement<T> {
        return this.getStatement<T>().whereIsNotNull(column);
    }
    public static get<T extends Model>(): Promise<T[]> {
        return this.getStatement<T>().get();
    }
    public static first<T extends Model>(): Promise<T> {
        return this.getStatement<T>().first();
    }
    public static exists<T extends Model>(id?: number): Promise<T> {
        return this.getStatement<T>().exists(id);
    }
    public static find<T extends Model>(id: number): Promise<T> {
        return this.where<T>('id', id.toString()).first();
    }

    public static create<T extends Model>(data: any): Promise<T> {
        return new Promise((resolve, reject) => {
            let insertData: any = {};
            this.fillable.forEach((attribute: string) => {
                if(data[attribute]) {
                    insertData[attribute] = data[attribute]
                }
            });
            //Insert data
            this.getStatement().insert(insertData).then((entity: storageEntity) => {
                //Resolve newly created entity of model
                resolve(<T>(new this(entity)));
            }).catch((error: any) => reject(error));
        });
    }
    public static delete<T extends Model>(entity: (number|T)|(number|T)[]): void {
        if(typeof entity == 'number') {
            storageInstance.delete({ table: this.table, id: entity });
        } else if(entity instanceof Array) {
            storageInstance.delete({ table: this.table, id: entity.map((entity: number|T) => typeof entity == 'number' ? entity : entity.id) });
        } else {
            storageInstance.delete({ table: this.table, id: entity.id })
        }
    }
    public save(): Promise<void> {
        return new Promise((resolve, reject) => {
            let model: any = this.constructor;
            let updateData: any = {};
            model.fields.forEach((attribute: string) => {
                if((<any>this)[attribute]) {
                    updateData[attribute] = (<any>this)[attribute]
                }
            });
            model.getStatement()[updateData.id ? 'update' : 'insert'](updateData).then((entity: storageEntity) => {
                model.fields.forEach((attribute: string) => (<any>this)[attribute] = entity[attribute]);
                resolve();
            }).catch((error: any) => reject(error));
        });
    }
    public delete(): Promise<void> {
        let model: any = this.constructor;
        return model.getStatement().delete(this.id);
    }
    public fill(data: any, acceptedRelations?: string|acceptedRelation|(string|acceptedRelation|acceptedRelation[])[]): Promise<void> {
        return new Promise((resolve, reject) => {
            //Set acceptedRelations to an array
            if(!acceptedRelations) {
                acceptedRelations = [];
            } else if(!(acceptedRelations instanceof Array)) {
                acceptedRelations = [acceptedRelations];
            }

            if(acceptedRelations.length > 0) {
                acceptedRelations = acceptedRelations.map((acceptedRelation: acceptedRelation|acceptedRelation[]) => {
                    if(typeof acceptedRelation == 'string') {
                        acceptedRelation = (<string>acceptedRelation).split('.').map((split: string) => ({ relation: split, explicit: false }));
                    } else if(!(acceptedRelation instanceof Array)) {
                        acceptedRelation = [acceptedRelation];
                    }
                    return acceptedRelation;
                });
            }

            let model: any = this.constructor;
            model.fillable.forEach((attribute: string) => {
                if(data[attribute]) {
                    (<any>this)[attribute] = data[attribute];
                }
            });

            this.save().then(() => {
                //Check for relation data
                let relations = model.getRelations();

                if(!relations) { relations = {}; }

                //Container for promises
                let promises: (() => BluebirdPromise<void>)[] = [];

                /*Walk through each relation existing in data (and in the
                AccepteRelation array) to fill it*/
                Object.keys(relations).filter((key: string) => !!data['_' + key] && (<acceptedRelation[][]>acceptedRelations).map((acceptedRelation: acceptedRelation[]) => acceptedRelation[0].relation).indexOf(key) != -1).forEach((key: string) => {
                    /*Remove none nested relations from accepted relations and
                    remove the first child in each nested relation*/
                    let newAcceptedRelation = (<acceptedRelation[][]>acceptedRelations).map((acceptedRelation: acceptedRelation[]) => acceptedRelation.slice(1, acceptedRelation.length)).filter((acceptedRelation: acceptedRelation[]) => acceptedRelation.length);
                    let relation: relationType = relations[key];

                    let tempData = data['_' + key];
                    //Make sure to put data in an array
                    if(relation.type == 'one') {
                        tempData = [tempData];
                    }

                    //Walk through each data
                    tempData.forEach((entityData: any, index: number) => {
                        //Add promise to fill data to relation model
                        promises.push(() => new BluebirdPromise((resolve, reject) => {
                            if(entityData.id) {
                                //If id is set find model entity in DB
                                relation.model.exists(entityData.id).then((entity: any) => {
                                    //Fill out found model
                                    entity.fill(entityData, newAcceptedRelation).then(() => {
                                        //Update data to entity
                                        if(relation.type == 'one') {
                                            data['_' + key] = entity;
                                        } else {
                                            data['_' + key][index] = entity;
                                        }
                                        resolve();
                                    }).catch((error: any) => reject(error));
                                }).catch((error: any) => reject(error));
                            } else {
                                //Create new model entity
                                let entity = (new relation.model());
                                //Fill out entity
                                entity.fill(entityData, newAcceptedRelation).then(() => {
                                    //Update data to entity
                                    if(relation.type == 'one') {
                                        data['_' + key] = entity;
                                    } else {
                                        data['_' + key][index] = entity;
                                    }
                                    resolve();
                                }).catch((error: any) => reject(error));
                            }
                        }));
                    });
                });

                //No promises were added: resolve
                if(promises.length == 0) { resolve(); return; }

                //Execute all relation promises
                Prom.sequence(promises, { useMode: promMode.simultaneous, breakOnReject: true }).then((output: promOutput) => {
                    if(output.rejects) { reject(output.results.find((result: any) => result.error)); return; }
                    //Attach all relations
                    let promises: (() => BluebirdPromise<void>)[] = [];
                    Object.keys(relations).filter((key: string) => !!data['_' + key]).forEach((key: string) => {
                        let explicit = !!(<acceptedRelation[][]>acceptedRelations).find((acceptedRelation: acceptedRelation[]) => acceptedRelation[0].relation == key && acceptedRelation[0].explicit);
                        promises.push(() => new BluebirdPromise((resolve, reject) => (<any>this)[key]().attach(data['_' + key], explicit).then(() => {
                            (<any>this)[`_${key}`] = data[`_${key}`];
                            resolve();
                        }).catch((error: any) => reject(error))));
                    });

                    Prom.sequence(promises, { useMode: promMode.simultaneous, breakOnReject: true }).then((output: promOutput) => {
                        if(output.rejects) { reject(output.results[0].error); return; }
                        resolve();
                    });
                });
            }).catch((error: any) => reject(error));
        });
    }

    public serialize(): { [key:string]: string } {
        let model: any = this.constructor;
        let returnObject: any = {};
        model.fields.concat(model.append).filter((field: string) => model.hidden.indexOf(field) == -1).forEach((field: string) => {
            returnObject[field] = (<any>this)[field].toString();
        });

        Object.keys(this).filter((key: string) => key[0] == '_').forEach((key: string) => {
            if((<any>this)[key]) {
                if((<any>this)[key] instanceof Array) {
                    returnObject[key.substr(1, key.length)] = (<any>this)[key].map((object: any) => object.serialize());
                } else {
                    returnObject[key.substr(1, key.length)] = (<any>this)[key].serialize();
                }
            }
        });

        return returnObject;
    }

    protected hasMany<T extends Model>(model: new() => T, columnKey: string): Relation<T> | relationType {
        let foreignTable: string = (<any>model).table;
        if(!this.id) {
            return <relationType>{ model, join: { table: foreignTable, firstColumn: 'id', secondColumn: columnKey }, type: 'many' };
        }
        return <Relation<T>>(<any>model).getRelationStatement({
            type: 'foreign',
            table: foreignTable,
            key: columnKey,
            id: this.id
        }).where({ column: columnKey, operator: '=', value: this.id });
    }
    protected belongsTo<T extends Model>(model: new() => T, columnKey: string): Relation<Model> | relationType {
        let foreignTable: string = (<any>model).table;
        if(!this.id) {
            return <relationType>{ model, join: { table: foreignTable, firstColumn: columnKey, secondColumn: 'id' }, type: 'one' };
        }
        return <Relation<T>>(<any>model).getRelationStatement({
            table: (<any>this).constructor.table,
            type: 'self',
            key: columnKey,
            id: this.id
        }).where({ column: 'id', operator: '=', value: (<any>this)[columnKey] });
    }
    protected belongsToMany<T extends Model>(model: new() => T, pivotTable: string, firstColumnKey: string, secondColumnKey: string): Relation<T> | relationType {
        let foreignTable: string = (<any>model).table;
        if(!this.id) {
            return <relationType>{ model, join: [
                { table: pivotTable, firstColumn: 'id', secondColumn: firstColumnKey },
                { table: foreignTable, sourceTable: pivotTable, firstColumn: secondColumnKey, secondColumn: 'id' }
            ], type: 'many'};
        }
        return <Relation<T>>(<any>model).getRelationStatement({
            type: 'pivot',
            table: pivotTable,
            key: firstColumnKey,
            secondKey: secondColumnKey,
            id: this.id
        }).join({ table: pivotTable, firstColumn: 'id', secondColumn: secondColumnKey }).where(pivotTable + '.' + firstColumnKey, this.id);
    }

    public static getRelation<T extends Model>(relation: string): relationType {
        let self: any = this.getInstance<T>();
        if(relation in self) {
            return self[relation]();
        }

        return null;
    }


    public static getRelations<T extends Model>(): { [key:string]: relationType } {
        let instance = this.getInstance<T>();
        let returnObject: any;
        Object.keys(instance).filter((key: string) => key[0] == '_').forEach((key: string) => {
            let relationKey = helpers.substr(key, 1, key.length);
            if(!returnObject) { returnObject = {}; }
            if((<any>instance)[relationKey]) {
                returnObject[relationKey] = (<any>instance)[relationKey]();
            }
        });

        return returnObject;
    }

    public static with<T extends Model>(relations: string|string[], statement?: Statement<T>, parent?: string): Statement<T> {
        if(typeof relations == 'string') {
            relations = [relations];
        }

        let returnStatement: Statement<T> = statement ? statement : this.getStatement<T>();
        relations.forEach((relation: string) => {
            let splitRelation = relation.split('.');
            let relationResult = this.getRelation(splitRelation[0]);

            if(relationResult) {
                returnStatement = returnStatement
                .select('self')
                .select(relationResult.model.fields.map((field: string) => ({ table: relationResult.model.table, column: field, as: (parent ? parent + '.' : this.table + '.') + splitRelation[0] + '.' + field })));
                if(relationResult.join instanceof Array) {
                    relationResult.join.forEach((join: join) => {
                        returnStatement = returnStatement.join({ sourceTable: this.table, ...join });
                    })
                } else {
                    returnStatement = returnStatement.join({ ...relationResult.join, sourceTable: this.table });
                }

                if(splitRelation[1]) {
                    returnStatement = relationResult.model.with(splitRelation.slice(1, splitRelation.length).join('.'), returnStatement, (parent ? parent + '.' + splitRelation[0] : this.table + '.' + splitRelation[0]));
                }
            }
        })

        return returnStatement;
    }

    /**
     * In order for the model inheritance to work it is very
     * important to overwrite this static method in the child
     * model class and specify the own class as generic type of
     Ä "Statement" class model
     */
    public static getStatement<T extends Model>(): Statement<T> {
        return new Statement<T>(this);
    }
    public static getRelationStatement<T extends Model>(relationInfo: relationDefinition): Relation<T> {
        if(!relationInfo.table) {
            relationInfo.table = this.table;
        }
        return new Relation(this, relationInfo);
    }
    public static getInstance<T extends Model>(): T {
        return <T>(new this());
    }

    public static get statement(): string {
        return this.getStatement().statement;
    }
}