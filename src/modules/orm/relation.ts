import { Model } from './model';
import { Statement } from './statement';
import { storage, entity } from '../../modules/storage';

export type relationDefinition = {
    type: 'self'|'foreign'|'pivot',
    table?: string,
    key: string,
    secondKey?: string,
    id?: null
};

export class Relation<T extends Model> extends Statement<T> {
    constructor(
        model: typeof Model,
        private relationInfo: relationDefinition
    ) {
        super(model);
    }

    /**
     * Attach one or multiple models to the generic provided model using its
     * relationship definition.
     * entities one or multiple model/model id to attatch
     * explicit detach any realtion not included in the entities
     */
    public attach(entities: number|entity|(number|entity)[], explicit: boolean = false): Promise<void> {
        return new Promise((resolve, reject) => {
            //Detach any old relation before attaching
            if(this.relationInfo.type != 'self' && explicit) {
                this.detach().then(() => {
                    this.attach(entities).then(() => resolve()).catch((error: any) => reject(error));
                }).catch((error: any) => reject(error));
            }

            //If relation is attached to the models own table
            if(this.relationInfo.type == 'self') {
                //Detach any old relation first
                this.detach().then(() => {
                    if(entities instanceof Array) {
                        reject(new Error('Can only attach one instance to the model'));
                        return;
                    }

                    storage.update({ table: this.relationInfo.table, data: {
                        id: this.relationInfo.id,
                        [this.relationInfo.key]: (typeof entities == 'number' ? entities : entities.id)
                    }}).then(() => resolve()).catch((error: any) => reject(error));
                }).catch((error: any) => reject(error));
            //If relation is attached to its related model table
        } else if (this.relationInfo.type == 'foreign') {
                if(!(entities instanceof Array)) {
                    entities = [entities];
                }

                storage.update({ table: this.table, data: (<(number|entity)[]>entities).map((data: number|entity) => ({
                    id: (typeof data == 'number' ? data : data.id),
                    [this.relationInfo.key]: this.relationInfo.id
                }))}).then(() => resolve()).catch((error: any) => reject(error));
            //If relation is specified with a pivot table
            } else if(this.relationInfo.type == 'pivot') {
                if(!(entities instanceof Array)) {
                    entities = [entities];
                }
                storage.insert({ table: this.relationInfo.table, data: (<(number|entity)[]>entities).map((data: number|entity) => ({
                    [this.relationInfo.key]: this.relationInfo.id,
                    [this.relationInfo.secondKey]: (typeof data == 'number' ? data : data.id)
                }))}).then(() => resolve()).catch((error: any) => reject(error));
            }
        });
    }
    public detach(relation?: number|entity|(number|entity)[]): Promise<void> {
        return new Promise((resolve, reject) => {
            if(this.relationInfo.type == 'self') {
                storage.update({ table: this.relationInfo.table, data: {
                    id: this.relationInfo.id,
                    [this.relationInfo.key]: null
                }}).then(() => resolve()).catch((error: any) => reject(error));
            } else if (this.relationInfo.type == 'foreign') {
                if(!relation) {
                    storage.update({
                        table: this.table,
                        data: { [this.relationInfo.key]: null },
                        alternateKey: {
                            name: 'project_id',
                            value: this.relationInfo.id
                        }
                    }).then(() => resolve())
                    .catch((error: any) => reject(error));
                    return;
                }
                if(!(relation instanceof Array)) {
                    relation = [relation];
                }
                storage.update({ table: this.table, data: (<(number|entity)[]>relation).map((data: number|entity) => ({
                    id: (typeof data == 'number' ? data : data.id),
                    [this.relationInfo.key]: null
                }))}).then(() => resolve()).catch((error: any) => reject(error));
            } else if(this.relationInfo.type == 'pivot') {
                if(!relation) {
                    storage.delete({ table: this.relationInfo.table, alternateKey: {
                        name: this.relationInfo.secondKey,
                        value: this.relationInfo.id
                    }}).then(() => resolve()).catch((error: any) => reject(error));
                    return;
                }
                if(!(relation instanceof Array)) {
                    relation = [relation];
                }

                storage.delete({ table: this.relationInfo.table, alternateKey: {
                    name: this.relationInfo.secondKey,
                    value: (<(number|entity)[]>relation).map((data: number|entity) => (typeof data == 'number' ? data.toString() : data.id.toString()))
                }}).then(() => resolve()).catch((error: any) => reject(error));
            }
        });
    }

}