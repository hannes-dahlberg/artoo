import { IStorageEntity, StorageService } from "../../services/storage.service";
import { container } from "../container.module";
import { ModelModule } from "./model.module";
import { IJoin, StatementModule } from "./statement.module";

const storage: StorageService = container.getService(StorageService);

export interface IRelationDefinition {
    type: "self" | "foreign" | "pivot";
    table?: string;
    key: string;
    secondKey?: string;
    id?: null;
}

export interface IRelationType { model: any; join: IJoin | IJoin[]; type: "one" | "many"; }

export class RelationModule<T extends ModelModule> extends StatementModule<T> {
    constructor(
        model: typeof ModelModule,
        private relationInfo: IRelationDefinition,
    ) { super(model); }

    /**
     * Attach one or multiple models to the generic provided model using its
     * relationship definition.
     * entities one or multiple model/model id to attatch
     * explicit detach any realtion not included in the entities
     */
    public attach(entities: number | IStorageEntity | Array<number | IStorageEntity>, explicit: boolean = false): Promise<void> {
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
                    storage.update({
                        data: {
                            id: this.relationInfo.id,
                            [this.relationInfo.key]: (typeof entities === "number" ? entities : (entities as IStorageEntity).id),
                        },
                        table: this.relationInfo.table,
                    }).then(() => resolve()).catch((error: any) => reject(error));
                }).catch((error: any) => reject(error));
                // If relation is attached to its related model table
            } else if (this.relationInfo.type === "foreign") {
                if (!(entities instanceof Array)) {
                    entities = [entities];
                }

                storage.update({
                    data: (entities as Array<number | IStorageEntity>).map((data: number | IStorageEntity) => ({
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
                storage.insert({
                    data: (entities as Array<number | IStorageEntity>).map((data: number | IStorageEntity) => ({
                        [this.relationInfo.key]: this.relationInfo.id,
                        [this.relationInfo.secondKey]: (typeof data === "number" ? data : data.id),
                    })),
                    table: this.relationInfo.table,
                }).then(() => resolve()).catch((error: any) => reject(error));
            }
        });
    }
    public detach(relation?: number | IStorageEntity | Array<number | IStorageEntity>): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.relationInfo.type === "self") {
                storage.update({
                    data: {
                        id: this.relationInfo.id,
                        [this.relationInfo.key]: null,
                    },
                    table: this.relationInfo.table,
                }).then(() => resolve()).catch((error: any) => reject(error));
            } else if (this.relationInfo.type === "foreign") {
                if (!relation) {
                    storage.update({
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
                storage.update({
                    data: (relation as Array<number | IStorageEntity>).map((data: number | IStorageEntity) => ({
                        id: (typeof data === "number" ? data : data.id),
                        [this.relationInfo.key]: null,
                    })),
                    table: this.table,
                }).then(() => resolve()).catch((error: any) => reject(error));
            } else if (this.relationInfo.type === "pivot") {
                if (!relation) {
                    storage.delete({
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

                storage.delete({
                    alternateKey: {
                        name: this.relationInfo.secondKey,
                        value: (relation as Array<number | IStorageEntity>).map((data: number | IStorageEntity) => (typeof data === "number" ? data.toString() : data.id.toString())),
                    },
                    table: this.relationInfo.table,
                }).then(() => resolve()).catch((error: any) => reject(error));
            }
        });
    }
}
