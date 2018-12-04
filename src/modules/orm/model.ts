// Libs
import * as BluebirdPromise from "bluebird";

// Modules
import * as helpers from "../helpers";
import { IOutput as promOutput, mode as promMode, Prom } from "../prom";
import { IEntity as storageEntity, instance as storageInstance } from "../storage";
import { IDefinition as relationDefinition, IType as relationType, Relation } from "./relation";
import { IJoin, IWhere, Statement } from "./statement";

export interface IAcceptedRelation { relation: string; explicit: boolean; }

export function serialize<T extends Model>(objects: T[]): any {
    return objects.map((object) => object.serialize());
}

export class Model {

    public static get statement(): string {
        return this.getStatement().statement;
    }
    public static table: string;
    public static fields: string[];
    public static fillable: string[] = [];
    public static hidden: string[] = [];
    public static append: string[] = [];

    public static where<T extends Model>(where: IWhere | string, value?: string): Statement<T> {
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
        return this.where<T>("id", id.toString()).first();
    }

    public static create<T extends Model>(data: any): Promise<T> {
        return new Promise((resolve, reject) => {
            const insertData: any = {};
            this.fillable.forEach((attribute: string) => {
                if (data[attribute]) {
                    insertData[attribute] = data[attribute];
                }
            });
            // Insert data
            this.getStatement().insert(insertData).then((entity: storageEntity) => {
                // Resolve newly created entity of model
                resolve((new this(entity)) as T);
            }).catch((error: any) => reject(error));
        });
    }
    public static delete<T extends Model>(entity: (number | T) | Array<number | T>): void {
        if (typeof entity == "number") {
            storageInstance.delete({ table: this.table, id: entity });
        } else if (entity instanceof Array) {
            storageInstance.delete({ table: this.table, id: entity.map((entity: number | T) => typeof entity == "number" ? entity : entity.id) });
        } else {
            storageInstance.delete({ table: this.table, id: entity.id });
        }
    }

    public static getRelation<T extends Model>(relation: string): relationType {
        const self: any = this.getInstance<T>();
        if (relation in self) {
            return self[relation]();
        }

        return null;
    }

    public static getRelations<T extends Model>(): { [key: string]: relationType } {
        const instance = this.getInstance<T>();
        let returnObject: any;
        Object.keys(instance).filter((key: string) => key[0] === "_").forEach((key: string) => {
            const relationKey = helpers.substr(key, 1, key.length);
            if (!returnObject) { returnObject = {}; }
            if ((instance as any)[relationKey]) {
                returnObject[relationKey] = (instance as any)[relationKey]();
            }
        });

        return returnObject;
    }

    public static with<T extends Model>(relations: string | string[], statement?: Statement<T>, parent?: string): Statement<T> {
        if (typeof relations === "string") {
            relations = [relations];
        }

        let returnStatement: Statement<T> = statement ? statement : this.getStatement<T>();
        relations.forEach((relation: string) => {
            const splitRelation = relation.split(".");
            const relationResult = this.getRelation(splitRelation[0]);

            if (relationResult) {
                returnStatement = returnStatement
                    .select("self")
                    .select(relationResult.model.fields.map((field: string) => ({ table: relationResult.model.table, column: field, as: (parent ? parent + "." : this.table + ".") + splitRelation[0] + "." + field })));
                if (relationResult.join instanceof Array) {
                    relationResult.join.forEach((join: IJoin) => {
                        returnStatement = returnStatement.join({ sourceTable: this.table, ...join });
                    });
                } else {
                    returnStatement = returnStatement.join({ ...relationResult.join, sourceTable: this.table });
                }

                if (splitRelation[1]) {
                    returnStatement = relationResult.model.with(splitRelation.slice(1, splitRelation.length).join("."), returnStatement, (parent ? parent + "." + splitRelation[0] : this.table + "." + splitRelation[0]));
                }
            }
        });

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
        if (!relationInfo.table) {
            relationInfo.table = this.table;
        }
        return new Relation(this, relationInfo);
    }
    public static getInstance<T extends Model>(): T {
        return (new this()) as T;
    }

    public id: number;

    constructor(entity: storageEntity = {}) {
        Object.keys(entity).forEach((key: string) => {
            (this as any)[key] = entity[key];
        });
    }
    public save(): Promise<void> {
        return new Promise((resolve, reject) => {
            const model: any = this.constructor;
            const updateData: any = {};
            model.fields.forEach((attribute: string) => {
                if ((this as any)[attribute]) {
                    updateData[attribute] = (this as any)[attribute];
                }
            });
            model.getStatement()[updateData.id ? "update" : "insert"](updateData).then((entity: storageEntity) => {
                model.fields.forEach((attribute: string) => (this as any)[attribute] = entity[attribute]);
                resolve();
            }).catch((error: any) => reject(error));
        });
    }
    public delete(): Promise<void> {
        const model: any = this.constructor;
        return model.getStatement().delete(this.id);
    }
    public fill(data: any, acceptedRelations?: string | IAcceptedRelation | Array<string | IAcceptedRelation | IAcceptedRelation[]>): Promise<void> {
        return new Promise((resolve, reject) => {
            // Set acceptedRelations to an array
            if (!acceptedRelations) {
                acceptedRelations = [];
            } else if (!(acceptedRelations instanceof Array)) {
                acceptedRelations = [acceptedRelations];
            }

            if (acceptedRelations.length > 0) {
                acceptedRelations = acceptedRelations.map((acceptedRelation: IAcceptedRelation | IAcceptedRelation[]) => {
                    if (typeof acceptedRelation == "string") {
                        acceptedRelation = (acceptedRelation as string).split(".").map((split: string) => ({ relation: split, explicit: false }));
                    } else if (!(acceptedRelation instanceof Array)) {
                        acceptedRelation = [acceptedRelation];
                    }
                    return acceptedRelation;
                });
            }

            const model: any = this.constructor;
            model.fillable.forEach((attribute: string) => {
                if (data[attribute]) {
                    (this as any)[attribute] = data[attribute];
                }
            });

            this.save().then(() => {
                // Check for relation data
                let relations = model.getRelations();

                if (!relations) { relations = {}; }

                // Container for promises
                const promises: Array<() => BluebirdPromise<void>> = [];

                /*Walk through each relation existing in data (and in the
                AccepteRelation array) to fill it*/
                Object.keys(relations).filter((key: string) => !!data["_" + key] && (acceptedRelations as IAcceptedRelation[][]).map((acceptedRelation: IAcceptedRelation[]) => acceptedRelation[0].relation).indexOf(key) != -1).forEach((key: string) => {
                    /*Remove none nested relations from accepted relations and
                    remove the first child in each nested relation*/
                    const newAcceptedRelation = (acceptedRelations as IAcceptedRelation[][])
                        .map((acceptedRelation: IAcceptedRelation[]) => acceptedRelation
                            .slice(1, acceptedRelation.length))
                        .filter((acceptedRelation: IAcceptedRelation[]) => acceptedRelation.length);
                    const relation: relationType = relations[key];

                    let tempData = data["_" + key];
                    // Make sure to put data in an array
                    if (relation.type === "one") {
                        tempData = [tempData];
                    }

                    // Walk through each data
                    tempData.forEach((entityData: any, index: number) => {
                        // Add promise to fill data to relation model
                        promises.push(() => new BluebirdPromise((resolve, reject) => {
                            if (entityData.id) {
                                // If id is set find model entity in DB
                                relation.model.exists(entityData.id).then((entity: any) => {
                                    // Fill out found model
                                    entity.fill(entityData, newAcceptedRelation).then(() => {
                                        // Update data to entity
                                        if (relation.type == "one") {
                                            data["_" + key] = entity;
                                        } else {
                                            data["_" + key][index] = entity;
                                        }
                                        resolve();
                                    }).catch((error: any) => reject(error));
                                }).catch((error: any) => reject(error));
                            } else {
                                // Create new model entity
                                const entity = (new relation.model());
                                // Fill out entity
                                entity.fill(entityData, newAcceptedRelation).then(() => {
                                    // Update data to entity
                                    if (relation.type === "one") {
                                        data["_" + key] = entity;
                                    } else {
                                        data["_" + key][index] = entity;
                                    }
                                    resolve();
                                }).catch((error: any) => reject(error));
                            }
                        }));
                    });
                });

                // No promises were added: resolve
                if (promises.length === 0) { resolve(); return; }

                // Execute all relation promises
                Prom.sequence(promises, { useMode: promMode.simultaneous, breakOnReject: true }).then((output: promOutput) => {
                    if (output.rejects) { reject(output.results.find((result: any) => result.error)); return; }
                    // Attach all relations
                    const promises: Array<() => BluebirdPromise<void>> = [];
                    Object.keys(relations).filter((key: string) => !!data["_" + key]).forEach((key: string) => {
                        const explicit = !!(acceptedRelations as IAcceptedRelation[][]).find((acceptedRelation: IAcceptedRelation[]) => acceptedRelation[0].relation === key && acceptedRelation[0].explicit);
                        promises.push(() => new BluebirdPromise((resolve, reject) => (this as any)[key]().attach(data["_" + key], explicit).then(() => {
                            (this as any)[`_${key}`] = data[`_${key}`];
                            resolve();
                        }).catch((error: any) => reject(error))));
                    });

                    Prom.sequence(promises, { useMode: promMode.simultaneous, breakOnReject: true }).then((output: promOutput) => {
                        if (output.rejects) { reject(output.results[0].error); return; }
                        resolve();
                    });
                });
            }).catch((error: any) => reject(error));
        });
    }

    public serialize(): { [key: string]: string } {
        const model: any = this.constructor;
        const returnObject: any = {};
        model.fields.concat(model.append).filter((field: string) => model.hidden.indexOf(field) === -1).forEach((field: string) => {
            returnObject[field] = (this as any)[field].toString();
        });

        Object.keys(this).filter((key: string) => key[0] === "_").forEach((key: string) => {
            if ((this as any)[key]) {
                if ((this as any)[key] instanceof Array) {
                    returnObject[key.substr(1, key.length)] = (this as any)[key].map((object: any) => object.serialize());
                } else {
                    returnObject[key.substr(1, key.length)] = (this as any)[key].serialize();
                }
            }
        });

        return returnObject;
    }

    protected hasMany<T extends Model>(model: new () => T, columnKey: string): Relation<T> | relationType {
        const foreignTable: string = (model as any).table;
        if (!this.id) {
            return { model, join: { table: foreignTable, firstColumn: "id", secondColumn: columnKey }, type: "many" } as relationType;
        }
        return (model as any).getRelationStatement({
            type: "foreign",
            table: foreignTable,
            key: columnKey,
            id: this.id,
        }).where({ column: columnKey, operator: "=", value: this.id }) as Relation<T>;
    }
    protected belongsTo<T extends Model>(model: new () => T, columnKey: string): Relation<Model> | relationType {
        const foreignTable: string = (model as any).table;
        if (!this.id) {
            return { model, join: { table: foreignTable, firstColumn: columnKey, secondColumn: "id" }, type: "one" } as relationType;
        }
        return (model as any).getRelationStatement({
            id: this.id,
            key: columnKey,
            table: (this as any).constructor.table,
            type: "self",
        }).where({ column: "id", operator: "=", value: (this as any)[columnKey] }) as Relation<T>;
    }
    protected belongsToMany<T extends Model>(model: new () => T, pivotTable: string, firstColumnKey: string, secondColumnKey: string): Relation<T> | relationType {
        const foreignTable: string = (model as any).table;
        if (!this.id) {
            return {
                join: [
                    { table: pivotTable, firstColumn: "id", secondColumn: firstColumnKey },
                    { table: foreignTable, sourceTable: pivotTable, firstColumn: secondColumnKey, secondColumn: "id" },
                ],
                model,
                type: "many",
            } as relationType;
        }
        return (model as any).getRelationStatement({
            id: this.id,
            key: firstColumnKey,
            secondKey: secondColumnKey,
            table: pivotTable,
            type: "pivot",
        }).join({ table: pivotTable, firstColumn: "id", secondColumn: secondColumnKey }).where(pivotTable + "." + firstColumnKey, this.id) as Relation<T>;
    }
}
