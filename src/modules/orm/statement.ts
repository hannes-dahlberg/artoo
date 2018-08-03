import { Model } from './Model';
import { storage, entity } from '../../modules/storage';
import * as helpers from '../../modules/helpers';

export type select = { table: string, column: string, as?: string } | string;
export type where = { table?: string, column: string, operator?: string, value: string };
export type whereNull = { table?: string, column: string, condition: 'NULL'|'NOT NULL' };
export type join = { table: string, alias?: string, sourceTable?: string, firstColumn: string, secondColumn: string };

type complexFields = { [key:string]: { model: any, keys: string[], type: 'one'|'many' } };

export class Statement<T extends Model> {
    constructor(
        private model: new(entity: entity) => T,
        protected table : string = (<any>model).table,
        protected fields: string[] = (<any>model).fields
    ) { }

    private selects: select[] = [];
    private wheres: where[] = [];
    private whereNulls: whereNull[] = [];
    private joins: join[] = [];

    public select(selects: select[] | select | 'self'): Statement<T> {
        if(selects == 'self') {
            if(this.selects.findIndex((select: select) => typeof select != 'string' && select.table == this.table && select.column == this.fields[0])) {
                this.fields.forEach((field: string) => {
                    this.selects.push({ table: this.table, column: field });
                });
            }
        } else if(selects instanceof Array) {
            this.selects = this.selects.concat(selects);
        } else {
            this.selects.push(selects);
        }
        return this;
    }

    public where(where: where|string, value?: string): Statement<T> {
        if(typeof where == 'string') {
            let whereSplit = where.split('.');
            let whereTable = whereSplit.length == 2 ? whereSplit[0] : null;
            let whereColumn = whereSplit.length == 2 ? whereSplit[1] : whereSplit[0];
            this.wheres.push({ ...(whereTable ? { table: whereTable} : {}), column: whereColumn, operator: '=', value});
        } else if(where.column) {
            this.wheres.push(where);
        }
        return this;
    }
    public whereIsNull(column: string): Statement<T> {
        return this.whereNull(column);
    }
    public whereIsNotNull(column: string): Statement<T> {
        return this.whereNull(column, 'NOT NULL');
    }
    private whereNull(column: string, condition: 'NULL'|'NOT NULL' = 'NULL'): Statement<T> {
        let whereSplit = column.split('.');
        let whereTable = whereSplit.length == 2 ? whereSplit[0] : null;
        let whereColumn = whereSplit.length == 2 ? whereSplit[1] : whereSplit[0];
        this.whereNulls.push({ ...(whereTable ? { table: whereTable } : {}), column: whereColumn, condition });

        return this;
    }

    public find(id: number): Promise<T> {
        return this.where('id', id.toString()).first();
    }

    public join(join: join): Statement<T> {
        this.joins.push(join);
        return this;
    }

    //TODO - fields are restricted to map to a model
    public scope(name: string, ...params: any[]): Statement<T> {
        name = helpers.ucFirst(name);
        if((<any>this).model[`scope${name}`]) {
            return (<any>this).model[`scope${name}`](this, ...params);
        }
        return this;
    }

    public get statement(): string {
        if(!this.selects.length) {
            this.select('self');
        }

        let statement: string = `SELECT`;

        if(this.selects.length) {
            statement += ` ` + this.selects
            .map((select => (typeof select == 'string') ? select : `[${select.table}].[${select.column}] AS ` + (select.as ? `[${select.as}]` : `[${select.table}.${select.column}]`)))
            .join(', ');
        }

        statement += ` FROM [${this.table}]`;

        if(this.joins.length) {
            statement += ` ` + this.joins
            .map((join => `LEFT JOIN [${join.table}]${(join.alias ? ` AS ${join.alias}` : '')} ON [${( join.sourceTable ? join.sourceTable : this.table)}].[${join.firstColumn}] = [${(join.alias ? join.alias : join.table)}].[${join.secondColumn}]`))
            .join(' ');
        }

        if(this.wheres.length) {
            statement += ` WHERE ` + this.wheres
            .map((where => `[${(where.table ? where.table : this.table)}].[${where.column}] ${(where.operator ? where.operator : '=')} '${where.value}'`))
            .join(' AND ');
        }

        if(this.whereNulls.length) {
            statement += (this.wheres.length ? ` AND ` : ` WHERE `) + this.whereNulls
            .map((whereNull => `[${(whereNull.table ? whereNull.table : this.table)}].[${whereNull.column}] IS ${whereNull.condition}`))
            .join(' AND ');
        }

        return statement;
    }

    public get(): Promise<T[]> {
        return new Promise((resolve, reject) => {
            storage.getAll(this.statement).then((rows: entity[]) => {
                if(!rows.length) { resolve(<T[]>[]); return; }
                let myMap = (relationName: string, model: any, rows: entity[]) => {
                    return helpers.groupBy(rows, model.fields.map((field: string) => `${relationName}.${field}`)).map((row: any) => {
                        let tempObject = new (model)()
                        Object.keys(row).filter((key: string) => key != '_rows').forEach((key: string) => {
                            tempObject[key.substr(key.indexOf('.') + 1, key.length)] = row[key];
                        });

                        if(row._rows) {
                            //Remove relationName key
                            row._rows = row._rows = row._rows.map((row: entity) => {
                                let returnObject: entity = {};
                                Object.keys(row).forEach((key: string) => {
                                    returnObject[key.substr(key.indexOf('.') + 1, key.length)] = row[key];
                                });
                                return returnObject;
                            });

                            let relations = helpers.unique(Object.keys(row._rows[0]).map((key: string) => key.substr(0, key.indexOf('.'))));
                            relations.forEach((relation: string) => {
                                let fetchRelation: any = model.getRelation(relation);
                                if(fetchRelation) {
                                    tempObject[`_${relation}`] = myMap(relation, (<any>model).getRelation(relation).model, row._rows).filter((object: any) => object != null);
                                    if(fetchRelation.type == 'one') {
                                        tempObject[`_${relation}`] = tempObject[`_${relation}`][0] ? tempObject[`_${relation}`][0] : null;
                                    }
                                }
                            });
                        }

                        return tempObject.id != null ? tempObject : null;
                    });
                }

                resolve(<T[]>myMap(this.table, this.model, rows));
            }).catch((error: any) => reject(error));
        })
    }
    public first(): Promise<T> {
        return new Promise((resolve, reject) => {
            this.get().then((rows: T[]) => resolve(rows.length ? rows[0] : null))
                .catch((error: any) => reject(error));
        });
    }
    public exists(id?: number): Promise<T> {
        return new Promise((resolve, reject) => {
            let statement = this;
            if(id) {
                statement.where('id', id.toString());
            }
            statement.first().then((row: T) => {
                if(!row) { reject(new Error('No entity found')); return; }
                resolve(row);
            }).catch((error: any) => reject(error));
        })
    }

    public insert(data: entity): Promise<entity> {
        return new Promise((resolve, reject) => {
            storage.insert({ table: this.table, data }).then((entity: entity) => {
                resolve(entity);
            }).catch((error: any) => reject(error));
        })
    }

    public update(data: entity): Promise<entity> {
        return new Promise((resolve, reject) => {
            storage.update({ table: this.table, data }).then((entity: entity) => {
                resolve(entity);
            }).catch((error: any) => reject(error));
        })
    }

    public delete(id: number): Promise<void> {
        return storage.delete({ table: this.table, id });
    }
}