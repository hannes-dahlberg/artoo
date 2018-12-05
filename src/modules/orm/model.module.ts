// Libs
import * as BluebirdPromise from "bluebird";

// Modules
import { HelperService } from "../../services/helpers.service";
import { IPromOutput, promMode, PromService } from "../../services/prom.service";
import { IStorageEntity, StorageService } from "../../services/storage.service";
import { container } from "../container.module";
import { IRelationDefinition, IRelationType, RelationModule  } from "./relation.module";
import { IJoin, IWhere, StatementModule } from "./statement.module";

const helpers: HelperService = container.getService(HelperService);
const prom: PromService = container.getService(PromService);
const storage: StorageService = container.getService(StorageService);

export interface IAcceptedRelation { relation: string; explicit: boolean; }

export function serialize<T extends ModelModule>(objects: T[]): any {
    return objects.map((object) => object.serialize());
}

export class ModelModule {

    public static get statement(): string {
        return this.getStatement().statement;
    }
    public static table: string;
    public static fields: string[];
    public static fillable: string[] = [];
    public static hidden: string[] = [];
    public static append: string[] = [];

    public static where<T extends ModelModule>(where: IWhere | string, value?: string): StatementModule<T> {
        return this.getStatement<T>().where(where, value);
    }
    public static whereIsNull<T extends ModelModule>(column: string): StatementModule<T> {
        return this.getStatement<T>().whereIsNull(column);
    }
    public static whereIsNotNull<T extends ModelModule>(column: string): StatementModule<T> {
        return this.getStatement<T>().whereIsNotNull(column);
    }
    public static get<T extends ModelModule>(): Promise<T[]> {
        return this.getStatement<T>().get();
    }
    public static first<T extends ModelModule>(): Promise<T> {
        return this.getStatement<T>().first();
    }
    public static exists<T extends ModelModule>(id?: number): Promise<T> {
        return this.getStatement<T>().exists(id);
    }
    public static find<T extends ModelModule>(id: number): Promise<T> {
        return this.where<T>("id", id.toString()).first();
    }

    public static create<T extends ModelModule>(data: any): Promise<T> {
        return new Promise((resolve, reject) => {
            const insertData: any = {};
            this.fillable.forEach((attribute: string) => {
                if (data[attribute]) {
                    insertData[attribute] = data[attribute];
                }
            });
            // Insert data
            this.getStatement().insert(insertData).then((entity: IStorageEntity) => {
                // Resolve newly created entity of model
                resolve((new this(entity)) as T);
            }).catch((error: any) => reject(error));
        });
    }
    public static delete<T extends ModelModule>(entity: (number | T) | Array<number | T>): void {
        if (typeof entity === "number") {
            storage.delete({ table: this.table, id: entity });
        } else if (entity instanceof Array) {
            storage.delete({ table: this.table, id: entity.map((e: number | T) => typeof e === "number" ? e : e.id) });
        } else {
            storage.delete({ table: this.table, id: entity.id });
        }
    }

    public static getRelation<T extends ModelModule>(relation: string): IRelationType {
        const self: any = this.getInstance<T>();
        if (relation in self) {
            return self[relation]();
        }

        return null;
    }

    public static getRelations<T extends ModelModule>(): { [key: string]: IRelationType } {
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

    public static with<T extends ModelModule>(relations: string | string[], statement?: StatementModule<T>, parent?: string): StatementModule<T> {
        if (typeof relations === "string") {
            relations = [relations];
        }

        let returnStatement: StatementModule<T> = statement ? statement : this.getStatement<T>();
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
     * "Statement" class model
     */
    public static getStatement<T extends ModelModule>(): StatementModule<T> {
        return new StatementModule<T>(this);
    }
    public static getRelationStatement<T extends ModelModule>(relationInfo: IRelationDefinition): RelationModule<T> {
        if (!relationInfo.table) {
            relationInfo.table = this.table;
        }
        return new RelationModule(this, relationInfo);
    }
    public static getInstance<T extends ModelModule>(): T {
        return (new this()) as T;
    }

    public id: number;

    constructor(entity: IStorageEntity = {}) {
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
            model.getStatement()[updateData.id ? "update" : "insert"](updateData).then((entity: IStorageEntity) => {
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
                    if (typeof acceptedRelation === "string") {
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
                Object.keys(relations).filter((key: string) => !!data["_" + key] && (acceptedRelations as IAcceptedRelation[][]).map((acceptedRelation: IAcceptedRelation[]) => acceptedRelation[0].relation).indexOf(key) !== -1).forEach((key: string) => {
                    /*Remove none nested relations from accepted relations and
                    remove the first child in each nested relation*/
                    const newAcceptedRelation = (acceptedRelations as IAcceptedRelation[][])
                        .map((acceptedRelation: IAcceptedRelation[]) => acceptedRelation
                            .slice(1, acceptedRelation.length))
                        .filter((acceptedRelation: IAcceptedRelation[]) => acceptedRelation.length);
                    const relation: IRelationType = relations[key];

                    let tempData = data["_" + key];
                    // Make sure to put data in an array
                    if (relation.type === "one") {
                        tempData = [tempData];
                    }

                    // Walk through each data
                    tempData.forEach((entityData: any, index: number) => {
                        // Add promise to fill data to relation model
                        promises.push(() => new BluebirdPromise((resolve2, reject2) => {
                            if (entityData.id) {
                                // If id is set find model entity in DB
                                relation.model.exists(entityData.id).then((entity: any) => {
                                    // Fill out found model
                                    entity.fill(entityData, newAcceptedRelation).then(() => {
                                        // Update data to entity
                                        if (relation.type === "one") {
                                            data["_" + key] = entity;
                                        } else {
                                            data["_" + key][index] = entity;
                                        }
                                        resolve2();
                                    }).catch((error: any) => reject2(error));
                                }).catch((error: any) => reject2(error));
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
                                    resolve2();
                                }).catch((error: any) => reject2(error));
                            }
                        }));
                    });
                });

                // No promises were added: resolve
                if (promises.length === 0) { resolve(); return; }

                // Execute all relation promises
                prom.sequence(promises, { useMode: promMode.simultaneous, breakOnReject: true }).then((output: IPromOutput) => {
                    if (output.rejects) { reject(output.results.find((result: any) => result.error)); return; }
                    // Attach all relations
                    const proms: Array<() => BluebirdPromise<void>> = [];
                    Object.keys(relations).filter((key: string) => !!data["_" + key]).forEach((key: string) => {
                        const explicit = !!(acceptedRelations as IAcceptedRelation[][]).find((acceptedRelation: IAcceptedRelation[]) => acceptedRelation[0].relation === key && acceptedRelation[0].explicit);
                        proms.push(() => new BluebirdPromise((resolve3, reject3) => (this as any)[key]().attach(data["_" + key], explicit).then(() => {
                            (this as any)[`_${key}`] = data[`_${key}`];
                            resolve3();
                        }).catch((error: any) => reject3(error))));
                    });

                    prom.sequence(proms, { useMode: promMode.simultaneous, breakOnReject: true }).then((o: IPromOutput) => {
                        if (o.rejects) { reject(o.results[0].error); return; }
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

    protected hasMany<T extends ModelModule>(model: new () => T, columnKey: string): RelationModule<T> | IRelationType {
        const foreignTable: string = (model as any).table;
        if (!this.id) {
            return { model, join: { table: foreignTable, firstColumn: "id", secondColumn: columnKey }, type: "many" } as IRelationType;
        }
        return (model as any).getRelationStatement({
            id: this.id,
            key: columnKey,
            table: foreignTable,
            type: "foreign",
        }).where({ column: columnKey, operator: "=", value: this.id }) as RelationModule<T>;
    }
    protected belongsTo<T extends ModelModule>(model: new () => T, columnKey: string): RelationModule<ModelModule> | IRelationType {
        const foreignTable: string = (model as any).table;
        if (!this.id) {
            return { model, join: { table: foreignTable, firstColumn: columnKey, secondColumn: "id" }, type: "one" } as IRelationType;
        }
        return (model as any).getRelationStatement({
            id: this.id,
            key: columnKey,
            table: (this as any).constructor.table,
            type: "self",
        }).where({ column: "id", operator: "=", value: (this as any)[columnKey] }) as RelationModule<T>;
    }
    protected belongsToMany<T extends ModelModule>(model: new () => T, pivotTable: string, firstColumnKey: string, secondColumnKey: string): RelationModule<T> | IRelationType {
        const foreignTable: string = (model as any).table;
        if (!this.id) {
            return {
                join: [
                    { table: pivotTable, firstColumn: "id", secondColumn: firstColumnKey },
                    { table: foreignTable, sourceTable: pivotTable, firstColumn: secondColumnKey, secondColumn: "id" },
                ],
                model,
                type: "many",
            } as IRelationType;
        }
        return (model as any).getRelationStatement({
            id: this.id,
            key: firstColumnKey,
            secondKey: secondColumnKey,
            table: pivotTable,
            type: "pivot",
        }).join({ table: pivotTable, firstColumn: "id", secondColumn: secondColumnKey }).where(pivotTable + "." + firstColumnKey, this.id) as RelationModule<T>;
    }
}
