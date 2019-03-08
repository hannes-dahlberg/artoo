import { HelperService } from "../../services/helpers.service";
import { IStorageEntity, StorageService } from "../../services/storage.service";
import { container } from "../container.module";
import { ModelModule } from "./model.module";

const helpers: HelperService = container.getService(HelperService);
const storage: StorageService = container.getService(StorageService);

export type select = { table: string, column: string, alias?: string } | string;
export interface IWhere { table?: string; column: string; operator?: string; value: string; }
export interface IWhereNull { table?: string; column: string; condition: "NULL" | "NOT NULL"; }
export interface IJoin { table: string; alias?: string; sourceTable?: string; firstColumn: string; secondColumn: string; }
export interface IOrderBy { table?: string; column: string; desc?: boolean; }
export interface ILimit { rows: number; offset?: number; }

interface IComplexFields { [key: string]: { model: any, keys: string[], type: "one" | "many" }; }

export class StatementModule<T extends ModelModule> {

    public get statement(): string {
        if (!this.selects.length) {
            this.select("self");
        }

        let statement: string = `SELECT`;

        if (this.selects.length) {
            statement += ` ` + this.selects
                .map(((s) => (typeof s === "string") ? s : `[${s.table}].[${s.column}] AS ` + (s.alias ? `[${s.alias}]` : `[${s.table}.${s.column}]`)))
                .join(", ");
        }

        statement += ` FROM [${this.table}]`;

        if (this.joins.length) {
            statement += ` ` + this.joins
                .map(((j) => `LEFT JOIN [${j.table}]${(j.alias ? ` AS [${j.alias}]` : "")} ON [${(j.sourceTable ? j.sourceTable : this.table)}].[${j.firstColumn}] = [${(j.alias ? j.alias : j.table)}].[${j.secondColumn}]`))
                .join(" ");
        }

        if (this.wheres.length) {
            statement += ` WHERE ` + this.wheres
                .map(((w) => `[${(w.table ? w.table : this.table)}].[${w.column}] ${(w.operator ? w.operator : "=")} '${w.value}'`))
                .join(" AND ");
        }

        if (this.whereNulls.length) {
            statement += (this.wheres.length ? ` AND ` : ` WHERE `) + this.whereNulls
                .map(((wn) => `[${(wn.table ? wn.table : this.table)}].[${wn.column}] IS ${wn.condition}`))
                .join(" AND ");
        }

        if (this.orderBys.length) {
            statement += ` ORDER BY ` + this.orderBys
                .map((ob) => `[${ob.table ? ob.table : this.table}].[${ob.column}] ${ob.desc ? "DESC" : "ASC"}`);
        }

        if (this.limits) {
            statement += ` LIMIT ` + (this.limits.offset || this.limits.rows) + (this.limits.offset ? `, ${this.limits.rows}` : ``);
        }

        return statement;
    }

    private selects: select[] = [];
    private wheres: IWhere[] = [];
    private whereNulls: IWhereNull[] = [];
    private joins: IJoin[] = [];
    private orderBys: IOrderBy[] = [];
    private limits: ILimit | null = null;
    constructor(
        private model: typeof ModelModule,
        protected table: string = (model as any).table,
        protected fields: string[] = (model as any).allFields,
    ) { }

    public select(selects: select[] | select | "self"): StatementModule<T> {
        if (selects === "self") {
            if (this.selects.findIndex((s: select) => typeof s !== "string" && s.table === this.table && s.column === this.fields[0])) {
                this.fields.forEach((field: string) => {
                    this.selects.push({ table: this.table, column: field });
                });
            }
        } else if (selects instanceof Array) {
            this.selects = this.selects.concat(selects);
        } else {
            this.selects.push(selects);
        }
        return this;
    }

    public where(where: IWhere): StatementModule<T>
    public where(where: string, value: string): StatementModule<T>
    public where(where: IWhere | string, value?: string): StatementModule<T> {
        if (typeof where === "string") {
            const whereSplit = where.split(".");
            const whereTable = whereSplit.length === 2 ? whereSplit[0] : null;
            const whereColumn = whereSplit.length === 2 ? whereSplit[1] : whereSplit[0];
            this.wheres.push({ ...(whereTable ? { table: whereTable } : {}), column: whereColumn, operator: "=", value });
        } else if (where.column) {
            this.wheres.push(where);
        }
        return this;
    }
    public whereIsNull(column: string): StatementModule<T> {
        return this.whereNull(column);
    }
    public whereIsNotNull(column: string): StatementModule<T> {
        return this.whereNull(column, "NOT NULL");
    }

    public orderBy(orderBy: IOrderBy): StatementModule<T>
    public orderBy(orderBy: string, desc: boolean): StatementModule<T>
    public orderBy(orderBy: string | IOrderBy, desc?: boolean): StatementModule<T> {
        if (typeof orderBy === "string") {
            const orderBySplit = orderBy.split(".");
            const orderByTable = orderBySplit.length === 2 ? orderBySplit[0] : null;
            const orderByColumn = orderBySplit.length === 2 ? orderBySplit[1] : orderBySplit[0];
            this.orderBys.push({ ...(orderByTable ? { table: orderByTable } : {}), column: orderByColumn, ...(desc !== undefined ? { desc } : {}) });
        } else if (orderBy.column) {
            this.orderBys.push(orderBy);
        }

        return this;
    }
    public limit(limit: ILimit): StatementModule<T>
    public limit(rows: number): StatementModule<T>
    public limit(offset: number, rows: number): StatementModule<T>
    public limit(offset: number | ILimit, rows?: number): StatementModule<T> {
        if (typeof offset !== "number") {
            this.limits = offset;
        } else {
            this.limits = { rows: rows !== undefined ? rows : offset, ...(rows !== undefined ? { offset } : null) };
        }

        return this;
    }

    public find(id: number): Promise<T> {
        return this.where("id", id.toString()).first();
    }

    public join(join: IJoin): StatementModule<T> {
        this.joins.push(join);
        return this;
    }

    // TODO - fields are restricted to map to a model
    public scope(name: string, ...params: any[]): StatementModule<T> {
        name = helpers.ucFirst(name);
        if ((this as any).model[`scope${name}`]) {
            return (this as any).model[`scope${name}`](this, ...params);
        }
        return this;
    }

    public count(): Promise<number> {
        this.selects = ["COUNT(*)"];
        return storage.count(this.statement);
    }

    public get(): Promise<T[]> {
        return new Promise((resolve, reject) => {
            storage.getAll(this.statement).then((rows: IStorageEntity[]) => {
                if (!rows.length) { resolve([] as T[]); return; }
                const myMap = (relationName: string, model: any, r: IStorageEntity[]) => {
                    return helpers.groupBy(r, model.allFields.map((field: string) => `${relationName}.${field}`)).map((row: any) => {
                        const tempObject = new (model)();
                        Object.keys(row).filter((key: string) => key !== "_rows").forEach((key: string) => {
                            tempObject[key.substr(key.indexOf(".") + 1, key.length)] = row[key];
                        });

                        if (row._rows) {
                            // Remove relationName key
                            row._rows = row._rows = row._rows.map((row2: IStorageEntity) => {
                                const returnObject: IStorageEntity = {};
                                Object.keys(row2).forEach((key: string) => {
                                    returnObject[key.substr(key.indexOf(".") + 1, key.length)] = row2[key];
                                });
                                return returnObject;
                            });

                            const relations = helpers.unique(Object.keys(row._rows[0]).map((key: string) => key.substr(0, key.indexOf("."))));
                            relations.forEach((relation: string) => {
                                const fetchRelation: any = model.getRelation(relation);
                                if (fetchRelation) {
                                    tempObject[`_${relation}`] = myMap(relation, (model as any).getRelation(relation).model, row._rows).filter((object: any) => object != null);
                                    if (fetchRelation.type === "one") {
                                        tempObject[`_${relation}`] = tempObject[`_${relation}`][0] ? tempObject[`_${relation}`][0] : null;
                                    }
                                }
                            });
                        }

                        return tempObject.id != null ? tempObject : null;
                    });
                };

                resolve(myMap(this.table, this.model, rows) as T[]);
            }).catch((error: any) => reject(error));
        });
    }
    public first(): Promise<T> {
        return new Promise((resolve, reject) => {
            this.get().then((rows: T[]) => resolve(rows.length ? rows[0] : undefined))
                .catch((error: any) => reject(error));
        });
    }
    public exists(id?: number): Promise<T> {
        return new Promise((resolve, reject) => {
            const statement = this;
            if (id) {
                statement.where("id", id.toString());
            }
            statement.first().then((row: T) => {
                if (!row) { reject(new Error("No entity found")); return; }
                resolve(row);
            }).catch((error: any) => reject(error));
        });
    }

    public insert(data: IStorageEntity): Promise<IStorageEntity> {
        return new Promise((resolve, reject) => {
            storage.insert({ table: this.table, data }).then((entity: IStorageEntity) => {
                resolve(entity);
            }).catch((error: any) => reject(error));
        });
    }

    public update(data: IStorageEntity): Promise<IStorageEntity> {
        return new Promise((resolve, reject) => {
            storage.update({ table: this.table, data }).then((entity: IStorageEntity) => {
                resolve(entity);
            }).catch((error: any) => reject(error));
        });
    }

    public delete(id: number): Promise<void> {
        return storage.delete({ table: this.table, id });
    }
    private whereNull(column: string, condition: "NULL" | "NOT NULL" = "NULL"): StatementModule<T> {
        const whereSplit = column.split(".");
        const whereTable = whereSplit.length === 2 ? whereSplit[0] : null;
        const whereColumn = whereSplit.length === 2 ? whereSplit[1] : whereSplit[0];
        this.whereNulls.push({ ...(whereTable ? { table: whereTable } : {}), column: whereColumn, condition });

        return this;
    }
}
