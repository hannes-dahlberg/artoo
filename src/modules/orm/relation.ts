import { ORM, storage } from "../../";

/*Need to do this because barrel prevents extending from namespace ORM.
Declaring class Relation would normally look like this:
export class Relation<T extends ORM.Model> extends ORM.Statement<T> but for some
reason this doesn't execute (does compile however). Instead Statement must be
imported as a standalone module*/
import { Statement } from "./statement";

export interface IDefinition {
    type: "self" | "foreign" | "pivot";
    table?: string;
    key: string;
    secondKey?: string;
    id?: null;
}

export interface IType { model: any; join: ORM.statement.join | ORM.statement.join[]; type: "one" | "many"; }

export class Relation<T extends ORM.Model> extends Statement<T> {
    constructor(
        model: typeof ORM.Model,
        private relationInfo: ORM.relation.definition,
    ) { super(model); }

    /**
     * Attach one or multiple models to the generic provided model using its
     * relationship definition.
     * entities one or multiple model/model id to attatch
     * explicit detach any realtion not included in the entities
     */
    public attach(entities: number | storage.IEntity | Array<number | storage.IEntity>, explicit: boolean = false): Promise<void> {
        return new Promise((resolve, reject) => {
            // Detach any old relation before attaching
            if (this.relationInfo.type !== "self" && explicit) {
                this.detach().then(() => {
                    this.attach(entities).then(() => resolve()).catch((error: any) => reject(error));
                }).catch((error: any) => reject(error));
            }

            // If relation is attached to the models own table
            if (this.relationInfo.type === "self") {
                /*Make sure no array of entities is provided since the relation
                only allows for one entity to be attached*/
                if (entities instanceof Array) {
                    reject(new Error("Can only attach one instance to the model"));
                    return;
                }

                // Detach any old relation first
                this.detach().then(() => {
                    storage.instance.update({
                        table: this.relationInfo.table, data: {
                            id: this.relationInfo.id,
                            [this.relationInfo.key]: (typeof entities === "number" ? entities : (entities as storage.IEntity).id),
                        },
                    }).then(() => resolve()).catch((error: any) => reject(error));
                }).catch((error: any) => reject(error));
                // If relation is attached to its related model table
            } else if (this.relationInfo.type === "foreign") {
                if (!(entities instanceof Array)) {
                    entities = [entities];
                }

                storage.instance.update({
                    data: (entities as Array<number | storage.IEntity>).map((data: number | storage.IEntity) => ({
                        id: (typeof data === "number" ? data : data.id),
                        [this.relationInfo.key]: this.relationInfo.id,
                    })),
                    table: this.table,
                }).then(() => resolve()).catch((error: any) => reject(error));
                // If relation is specified with a pivot table
            } else if (this.relationInfo.type === "pivot") {
                if (!(entities instanceof Array)) {
                    entities = [entities];
                }
                storage.instance.insert({
                    table: this.relationInfo.table, data: (entities as Array<number | storage.IEntity>).map((data: number | storage.IEntity) => ({
                        [this.relationInfo.key]: this.relationInfo.id,
                        [this.relationInfo.secondKey]: (typeof data === "number" ? data : data.id),
                    })),
                }).then(() => resolve()).catch((error: any) => reject(error));
            }
        });
    }
    public detach(relation?: number | storage.IEntity | Array<number | storage.IEntity>): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.relationInfo.type === "self") {
                storage.instance.update({
                    table: this.relationInfo.table, data: {
                        id: this.relationInfo.id,
                        [this.relationInfo.key]: null,
                    },
                }).then(() => resolve()).catch((error: any) => reject(error));
            } else if (this.relationInfo.type === "foreign") {
                if (!relation) {
                    storage.instance.update({
                        alternateKey: {
                            name: "project_id",
                            value: this.relationInfo.id,
                        },
                        data: { [this.relationInfo.key]: null },
                        table: this.table,
                    }).then(() => resolve())
                        .catch((error: any) => reject(error));
                    return;
                }
                if (!(relation instanceof Array)) {
                    relation = [relation];
                }
                storage.instance.update({
                    data: (relation as Array<number | storage.IEntity>).map((data: number | storage.IEntity) => ({
                        id: (typeof data === "number" ? data : data.id),
                        [this.relationInfo.key]: null,
                    })),
                    table: this.table,
                }).then(() => resolve()).catch((error: any) => reject(error));
            } else if (this.relationInfo.type === "pivot") {
                if (!relation) {
                    storage.instance.delete({
                        alternateKey: {
                            name: this.relationInfo.secondKey,
                            value: this.relationInfo.id,
                        },
                        table: this.relationInfo.table,
                    }).then(() => resolve()).catch((error: any) => reject(error));
                    return;
                }
                if (!(relation instanceof Array)) {
                    relation = [relation];
                }

                storage.instance.delete({
                    alternateKey: {
                        name: this.relationInfo.secondKey,
                        value: (relation as Array<number | storage.IEntity>).map((data: number | storage.IEntity) => (typeof data === "number" ? data.toString() : data.id.toString())),
                    },
                    table: this.relationInfo.table,
                }).then(() => resolve()).catch((error: any) => reject(error));
            }
        });
    }
}
