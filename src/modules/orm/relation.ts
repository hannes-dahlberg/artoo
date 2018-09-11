import { ORM, storage } from '../../';

export type definition = {
    type: 'self'|'foreign'|'pivot',
    table?: string,
    key: string,
    secondKey?: string,
    id?: null
};

export type type = { model: any, join: ORM.statement.join|ORM.statement.join[], type: 'one'|'many' };
export type acceptedRelation = { relation: string, explicit: boolean }


export class Relation<T extends ORM.Model> extends ORM.Statement<T> {
    constructor(
        model: typeof ORM.Model,
        private relationInfo: definition
    ) {
        super(model);
    }

    /**
     * Attach one or multiple models to the generic provided model using its
     * relationship definition.
     * entities one or multiple model/model id to attatch
     * explicit detach any realtion not included in the entities
     */
    public attach(entities: number|storage.entity|(number|storage.entity)[], explicit: boolean = false): Promise<void> {
        return new Promise((resolve, reject) => {
            //Detach any old relation before attaching
            if(this.relationInfo.type != 'self' && explicit) {
                this.detach().then(() => {
                    this.attach(entities).then(() => resolve()).catch((error: any) => reject(error));
                }).catch((error: any) => reject(error));
            }

            //If relation is attached to the models own table
            if(this.relationInfo.type == 'self') {
                /*Make sure no array of entities is provided since the relation
                only allows for one entity to be attached*/
                if(entities instanceof Array) {
                    reject(new Error('Can only attach one instance to the model'));
                    return;
                }

                //Detach any old relation first
                this.detach().then(() => {
                    storage.instance.update({ table: this.relationInfo.table, data: {
                        id: this.relationInfo.id,
                        [this.relationInfo.key]: (typeof entities == 'number' ? entities : (<storage.entity>entities).id)
                    }}).then(() => resolve()).catch((error: any) => reject(error));
                }).catch((error: any) => reject(error));
            //If relation is attached to its related model table
        } else if (this.relationInfo.type == 'foreign') {
                if(!(entities instanceof Array)) {
                    entities = [entities];
                }

                storage.instance.update({ table: this.table, data: (<(number|storage.entity)[]>entities).map((data: number|storage.entity) => ({
                    id: (typeof data == 'number' ? data : data.id),
                    [this.relationInfo.key]: this.relationInfo.id
                }))}).then(() => resolve()).catch((error: any) => reject(error));
            //If relation is specified with a pivot table
            } else if(this.relationInfo.type == 'pivot') {
                if(!(entities instanceof Array)) {
                    entities = [entities];
                }
                storage.instance.insert({ table: this.relationInfo.table, data: (<(number|storage.entity)[]>entities).map((data: number|storage.entity) => ({
                    [this.relationInfo.key]: this.relationInfo.id,
                    [this.relationInfo.secondKey]: (typeof data == 'number' ? data : data.id)
                }))}).then(() => resolve()).catch((error: any) => reject(error));
            }
        });
    }
    public detach(relation?: number|storage.entity|(number|storage.entity)[]): Promise<void> {
        return new Promise((resolve, reject) => {
            if(this.relationInfo.type == 'self') {
                storage.instance.update({ table: this.relationInfo.table, data: {
                    id: this.relationInfo.id,
                    [this.relationInfo.key]: null
                }}).then(() => resolve()).catch((error: any) => reject(error));
            } else if (this.relationInfo.type == 'foreign') {
                if(!relation) {
                    storage.instance.update({
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
                storage.instance.update({ table: this.table, data: (<(number|storage.entity)[]>relation).map((data: number|storage.entity) => ({
                    id: (typeof data == 'number' ? data : data.id),
                    [this.relationInfo.key]: null
                }))}).then(() => resolve()).catch((error: any) => reject(error));
            } else if(this.relationInfo.type == 'pivot') {
                if(!relation) {
                    storage.instance.delete({ table: this.relationInfo.table, alternateKey: {
                        name: this.relationInfo.secondKey,
                        value: this.relationInfo.id
                    }}).then(() => resolve()).catch((error: any) => reject(error));
                    return;
                }
                if(!(relation instanceof Array)) {
                    relation = [relation];
                }

                storage.instance.delete({ table: this.relationInfo.table, alternateKey: {
                    name: this.relationInfo.secondKey,
                    value: (<(number|storage.entity)[]>relation).map((data: number|storage.entity) => (typeof data == 'number' ? data.toString() : data.id.toString()))
                }}).then(() => resolve()).catch((error: any) => reject(error));
            }
        });
    }

}